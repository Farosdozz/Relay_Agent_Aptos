import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } from '@aptos-labs/ts-sdk';
import { AgentRuntime, LocalSigner } from 'move-agent-kit';
import { createAptosTools } from 'move-agent-kit';

import { MemoryService } from './memory.service';
import { UserService } from '../../user/user.service';
import { convertToOpenAIFunctions, executeTool } from '../utils/tool-adapter.utils';
import { EncryptService } from 'src/shared/services/encrypt/encrypt.service';
import { MEDIUM_OPENAI_MODEL, SMALL_OPENAI_MODEL } from '../constants';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  public readonly openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private memoryService: MemoryService,
    private encryptService: EncryptService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  /**
   * Get or create user's Aptos wallet from profile
   */
  async getUserWallet(userId: string): Promise<LocalSigner> {
    const user = await this.userService.findOneByUserIdWithPrivateKey(userId);
    if (!user.walletProfile?.encryptedPrivateKey) {
      throw new Error('User wallet not found');
    }

    // Decrypt user's encrypted private key
    let privateKeyHex = this.encryptService.decrypKeyHash(
      user.walletProfile.encryptedPrivateKey
    );

    try {
      // Create Account from private key
      const privateKey = new Ed25519PrivateKey(privateKeyHex);
      const account = Account.fromPrivateKey({ privateKey });
      
      // Get network configuration
      const network = this.configService.get('APTOS_NETWORK') === 'testnet' 
        ? Network.TESTNET 
        : Network.MAINNET;
      
      // Create LocalSigner
      const signer = new LocalSigner(account, network);
      return signer;
    } finally {
      // Clear sensitive data from memory
      privateKeyHex = null;
    }
  }

  /**
   * Initialize Aptos agent runtime with user's wallet
   */
  async initializeAgentRuntime(userId: string): Promise<AgentRuntime> {
    // Get user's wallet signer
    const signer = await this.getUserWallet(userId);
    
    // Initialize Aptos client
    const network = this.configService.get('APTOS_NETWORK') === 'testnet' 
      ? Network.TESTNET 
      : Network.MAINNET;
    
    const aptosConfig = new AptosConfig({ 
      network,
      fullnode: this.configService.get('APTOS_NODE_URL')
    });
    const aptos = new Aptos(aptosConfig);
    
    // Create agent runtime
    const agentRuntime = new AgentRuntime(signer, aptos, {
      PANORA_API_KEY: this.configService.get('PANORA_API_KEY'),
      OPENAI_API_KEY: this.configService.get('OPENAI_API_KEY')
    });
    
    return agentRuntime;
  }

  /**
   * Main chat handler
   */
  async chat(
    userId: string, 
    sessionId: string, 
    message: string
  ): Promise<{
    sessionId: string;
    message: string;
    toolCalls?: any[];
  }> {
    try {
      // Initialize agent runtime and tools
      const agentRuntime = await this.initializeAgentRuntime(userId);
      const tools = createAptosTools(agentRuntime);
      const functions = convertToOpenAIFunctions(tools);

      // Store user message
      await this.memoryService.addMemory({
        userId,
        sessionId,
        role: 'user',
        content: { text: message },
      });

      // Get conversation history
      const conversationHistory = await this.memoryService.getFormattedSessionHistory(
        sessionId,
        userId
      );

      // Call OpenAI with tools
      const completion = await this.openai.chat.completions.create({
        model: this.configService.get('OPENAI_MODEL') || MEDIUM_OPENAI_MODEL,
        messages: conversationHistory,
        tools: functions,
        tool_choice: 'auto',
      });

      const responseMessage = completion.choices[0].message;
      let toolResults = [];

      // Handle tool calls
      if (responseMessage.tool_calls) {
        for (const toolCall of responseMessage.tool_calls) {
          try {
            const result = await executeTool(
              toolCall.function.name,
              JSON.parse(toolCall.function.arguments),
              tools
            );

            toolResults.push({
              toolName: toolCall.function.name,
              args: JSON.parse(toolCall.function.arguments),
              result,
            });

            // Store tool call and result
            await this.memoryService.addMemory({
              userId,
              sessionId,
              role: 'tool',
              content: { 
                text: result,
                source: toolCall.function.name 
              },
              metadata: {
                toolCall: {
                  id: toolCall.id,
                  name: toolCall.function.name,
                  arguments: toolCall.function.arguments,
                  result,
                }
              }
            });
          } catch (error) {
            this.logger.error(`Tool execution failed: ${error.message}`);
            // Store error result
            await this.memoryService.addMemory({
              userId,
              sessionId,
              role: 'tool',
              content: { 
                text: `Error: ${error.message}`,
                source: toolCall.function.name 
              },
              metadata: {
                toolCall: {
                  id: toolCall.id,
                  name: toolCall.function.name,
                  arguments: toolCall.function.arguments,
                  error: error.message,
                }
              }
            });
          }
        }

        // Get final response after tool execution
        const updatedHistory = await this.memoryService.getFormattedSessionHistory(
          sessionId,
          userId
        );

        const finalCompletion = await this.openai.chat.completions.create({
          model: this.configService.get('OPENAI_MODEL') || MEDIUM_OPENAI_MODEL,
          messages: updatedHistory,
        });

        const finalMessage = finalCompletion.choices[0].message.content;

        // Store assistant response
        await this.memoryService.addMemory({
          userId,
          sessionId,
          role: 'assistant',
          content: { text: finalMessage },
        });

        return {
          sessionId,
          message: finalMessage,
          toolCalls: toolResults,
        };
      }

      // No tool calls, just return the response
      const assistantMessage = responseMessage.content;

      // Store assistant response
      await this.memoryService.addMemory({
        userId,
        sessionId,
        role: 'assistant',
        content: { text: assistantMessage },
      });

      return {
        sessionId,
        message: assistantMessage,
      };
    } catch (error) {
      this.logger.error('Chat error:', error);
      throw error;
    }
  }

  /**
   * Streaming chat handler
   */
  async *chatStream(
    userId: string,
    sessionId: string,
    message: string
  ): AsyncGenerator<string, void, unknown> {
    try {
      // Initialize agent runtime and tools
      const agentRuntime = await this.initializeAgentRuntime(userId);
      const tools = createAptosTools(agentRuntime);
      const functions = convertToOpenAIFunctions(tools);

      // Store user message
      await this.memoryService.addMemory({
        userId,
        sessionId,
        role: 'user',
        content: { text: message },
      });

      // Get conversation history
      const conversationHistory = await this.memoryService.getFormattedSessionHistory(
        sessionId,
        userId
      );

      // Create streaming completion
      const stream = await this.openai.chat.completions.create({
        model: this.configService.get('OPENAI_MODEL') || MEDIUM_OPENAI_MODEL,
        messages: conversationHistory,
        tools: functions,
        tool_choice: 'auto',
        stream: true,
      });

      let functionName = '';
      let functionArgs = '';
      let assistantMessage = '';

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;

        if (delta?.tool_calls) {
          const toolCallDelta = delta.tool_calls[0];
          if (toolCallDelta?.function?.name) {
            functionName = toolCallDelta.function.name;
          }
          if (toolCallDelta?.function?.arguments) {
            functionArgs += toolCallDelta.function.arguments;
          }

          // When we have a complete function call
          if (functionName && functionArgs && chunk.choices[0]?.finish_reason) {
            try {
              // Execute the tool
              const result = await executeTool(
                functionName,
                JSON.parse(functionArgs),
                tools
              );

              // Yield tool execution event
              yield JSON.stringify({
                event: 'tool_call',
                data: {
                  name: functionName,
                  args: JSON.parse(functionArgs),
                  result,
                }
              }) + '\n\n';

              // Store tool result
              await this.memoryService.addMemory({
                userId,
                sessionId,
                role: 'tool',
                content: { text: result, source: functionName },
                metadata: {
                  toolCall: {
                    name: functionName,
                    arguments: functionArgs,
                    result,
                  }
                }
              });

              // Get response after tool execution
              const updatedHistory = await this.memoryService.getFormattedSessionHistory(
                sessionId,
                userId
              );

              const responseStream = await this.openai.chat.completions.create({
                model: this.configService.get('OPENAI_MODEL') || MEDIUM_OPENAI_MODEL,
                messages: updatedHistory,
                stream: true,
              });

              for await (const responseChunk of responseStream) {
                const content = responseChunk.choices[0]?.delta?.content;
                if (content) {
                  assistantMessage += content;
                  yield JSON.stringify({
                    event: 'message',
                    data: { content }
                  }) + '\n\n';
                }
              }
            } catch (error) {
              this.logger.error(`Tool execution failed: ${error.message}`);
              yield JSON.stringify({
                event: 'error',
                data: { error: error.message }
              }) + '\n\n';
            }
          }
        } else if (delta?.content) {
          // Regular message content
          assistantMessage += delta.content;
          yield JSON.stringify({
            event: 'message',
            data: { content: delta.content }
          }) + '\n\n';
        }
      }

      // Store final assistant message
      if (assistantMessage) {
        await this.memoryService.addMemory({
          userId,
          sessionId,
          role: 'assistant',
          content: { text: assistantMessage },
        });
      }

      // Send done event
      yield JSON.stringify({
        event: 'done',
        data: {}
      }) + '\n\n';

    } catch (error) {
      this.logger.error('Stream error:', error);
      yield JSON.stringify({
        event: 'error',
        data: { error: error.message }
      }) + '\n\n';
    }
  }

  /**
   * Generate session title based on first message
   */
  async generateSessionTitle(_sessionId: string, firstMessage: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: SMALL_OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: 'Generate a short, descriptive title (max 5 words) for this conversation based on the first message. Respond with only the title, no quotes or punctuation.',
          },
          {
            role: 'user',
            content: firstMessage,
          },
        ],
        max_tokens: 20,
        temperature: 0.7,
      });

      return completion.choices[0].message.content?.trim() || 'New Conversation';
    } catch (error) {
      this.logger.error('Failed to generate session title:', error);
      return 'New Conversation';
    }
  }
}