import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Logger,
  UseGuards,
  Get,
  Param,
  Req,
  Delete,
  ForbiddenException,
  Query,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AiService } from '../services/ai.service';
import { MemoryService } from '../services/memory.service';
import { Response } from 'express';
import { ChatRequestDto, CreateSessionDto, UpdateSessionTitleDto } from '../dto/chat-request.dto';
import {
  ChatResponseDto,
  SessionResponseDto,
  MessagesResponseDto,
  PaginatedSessionListResponseDto,
} from '../dto/chat-response.dto';
import { ErrorResponseDto } from '../dto/error-response.dto';
import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';
import { PaginationQueryDto } from '../dto/pagination.dto';

@ApiBearerAuth()
@ApiTags('ai')
@Controller('ai')
export class AIController {
  private readonly logger = new Logger(AIController.name);

  constructor(
    private aiService: AiService,
    private memoryService: MemoryService,
  ) {}

  // Helper method to write and flush SSE data
  private writeSSE(res: Response, data: any): void {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    // Try to flush if the method exists
    try {
      if (res.socket && !res.socket.destroyed) {
        // Force flush by manipulating the underlying socket
        (res as any).flush?.();
      }
    } catch (e) {
      // Ignore flush errors
      this.logger.debug(`Flush error: ${e.message}`);
    }
  }

  @Post('sessions')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Create a new chat session' })
  @ApiResponse({
    status: 200,
    description: 'Session created successfully',
    type: SessionResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  @ApiBody({ type: CreateSessionDto })
  async createSession(
    @Body() createDto: CreateSessionDto,
    @Req() req: any,
  ): Promise<{ sessionId: string }> {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        this.logger.error('User ID not found in request', req.user);
        throw new BadRequestException('User authentication failed - no user ID found');
      }
      
      const sessionId = await this.memoryService.createSession(
        userId,
        createDto.title,
      );
      return { sessionId };
    } catch (error) {
      this.logger.error(`Error creating session: ${error.message}`);
      throw error;
    }
  }

  @Get('sessions')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'List user chat sessions' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (starts from 1)',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (max 100)',
    type: Number,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort field (createdAt, updatedAt, title)',
    type: String,
  })
  @ApiQuery({
    name: 'order',
    required: false,
    description: 'Sort order (asc/desc)',
    enum: ['asc', 'desc'],
  })
  @ApiResponse({
    status: 200,
    description: 'Sessions retrieved successfully',
    type: PaginatedSessionListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async listSessions(
    @Req() req: any,
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedSessionListResponseDto> {
    try {
      const userId = req.user?.userId;

      // Get sessions with pagination
      const result = await this.memoryService.listSessions(userId, {
        page: paginationQuery.page,
        limit: paginationQuery.limit,
        sort: paginationQuery.sort,
        order: paginationQuery.order,
      });

      // Calculate pagination metadata
      const totalPages = Math.ceil(result.total / paginationQuery.limit);

      return {
        sessions: result.sessions,
        pagination: {
          totalItems: result.total,
          itemsPerPage: paginationQuery.limit,
          totalPages,
          currentPage: paginationQuery.page,
          hasNextPage: paginationQuery.page < totalPages,
          hasPrevPage: paginationQuery.page > 1,
        },
      };
    } catch (error) {
      this.logger.error(`Error listing sessions: ${error.message}`);
      throw error;
    }
  }

  @Get('sessions/:sessionId')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Get a specific chat session' })
  @ApiResponse({
    status: 200,
    description: 'Session retrieved successfully',
    type: SessionResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to access this session',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Session not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async getSession(
    @Param('sessionId') sessionId: string,
    @Req() req: any,
  ): Promise<{ session: any }> {
    try {
      const userId = req.user?.userId;
      const session = await this.memoryService.getSession(sessionId, userId);

      if (!session) {
        throw new ForbiddenException(
          'Session not found or you do not have access to it',
        );
      }

      return { session };
    } catch (error) {
      this.logger.error(`Error getting session: ${error.message}`);
      throw error;
    }
  }

  @Delete('sessions/:sessionId')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Delete a chat session' })
  @ApiResponse({
    status: 200,
    description: 'Session deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to delete this session',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async deleteSession(
    @Param('sessionId') sessionId: string,
    @Req() req: any,
  ): Promise<{ success: boolean }> {
    try {
      const userId = req.user?.userId;
      // Check if session exists and belongs to user
      const session = await this.memoryService.getSession(sessionId, userId);

      if (!session) {
        throw new ForbiddenException(
          'Session not found or you do not have access to it',
        );
      }

      await this.memoryService.deleteSession(sessionId, userId);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error deleting session: ${error.message}`);
      throw error;
    }
  }

  @Get('sessions/:sessionId/messages')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Get messages from a session' })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
    type: MessagesResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to access this session',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async getMessages(
    @Param('sessionId') sessionId: string,
    @Req() req: any,
  ): Promise<{ messages: any[] }> {
    try {
      const userId = req.user?.userId;
      // Check if session exists and belongs to user
      const session = await this.memoryService.getSession(sessionId, userId);

      if (!session) {
        throw new ForbiddenException(
          'Session not found or you do not have access to it',
        );
      }

      // Retrieve messages but exclude session metadata
      const messages = await this.memoryService.getSessionMemories(
        sessionId,
        userId,
      );

      // Create a simple clean response format
      const cleanMessages = [];

      // Track assistant messages with their tool results for merging
      const assistantToolMap = new Map();

      // First pass: identify assistant messages with tool calls
      for (const msg of messages) {
        if (msg.role === 'assistant' && msg.metadata?.toolCalls?.length > 0) {
          // Create a map entry to collect tool results
          const msgId = (msg as any)._id?.toString();
          if (msgId) {
            assistantToolMap.set(msgId, {
              assistantMessage: msg,
              toolResults: [],
            });
          }
        }
      }

      // Second pass: collect tool results for each assistant message
      for (const msg of messages) {
        if (msg.role === 'tool' && msg.metadata?.toolCallId) {
          // Find parent assistant message
          const parentAssistantEntry = [...assistantToolMap.values()].find(
            (entry: any) =>
              entry.assistantMessage.metadata.toolCalls.some(
                (tc: any) => tc.id === msg.metadata.toolCallId,
              ),
          );

          if (parentAssistantEntry) {
            // Add tool result to the appropriate parent
            parentAssistantEntry.toolResults.push({
              id: msg.metadata.toolCallId,
              name: msg.metadata.name || '',
              result: msg.content.text,
            });
          }
        }
      }

      // Final pass: create clean messages array
      for (const msg of messages) {
        const msgDoc = msg as any;

        if (
          msg.role === 'user' ||
          (msg.role === 'assistant' && !msg.metadata?.toolCalls?.length)
        ) {
          // Simple messages go directly to output
          cleanMessages.push({
            id: msgDoc._id,
            role: msg.role,
            content: msg.content.text,
            createdAt: msgDoc.createdAt,
          });
        } else if (
          msg.role === 'assistant' &&
          msg.metadata?.toolCalls?.length > 0
        ) {
          // For assistant messages with tool calls, include the tools and results
          const msgId = msgDoc._id?.toString();
          const entry = msgId ? assistantToolMap.get(msgId) : null;

          if (entry) {
            cleanMessages.push({
              id: msgDoc._id,
              role: msg.role,
              content: msg.content.text,
              createdAt: msgDoc.createdAt,
              tools: msg.metadata.toolCalls.map((tc: any) => ({
                id: tc.id,
                name: tc.name,
                arguments: tc.arguments,
                // Find the corresponding result
                result:
                  entry.toolResults.find((tr: any) => tr.id === tc.id)?.result ||
                  null,
              })),
            });
          }
        }
        // Skip tool messages as they're incorporated into assistant messages
      }

      return { messages: cleanMessages };
    } catch (error) {
      this.logger.error(`Error getting messages: ${error.message}`);
      throw error;
    }
  }

  @Post('sessions/:sessionId/title')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Update the title of a chat session' })
  @ApiResponse({
    status: 200,
    description: 'Session title updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Session title updated successfully' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to update this session',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  @ApiBody({ type: UpdateSessionTitleDto })
  async updateSessionTitle(
    @Param('sessionId') sessionId: string,
    @Body() updateTitleDto: UpdateSessionTitleDto,
    @Req() req: any,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const userId = req.user?.userId;
      
      // Validate title word count (max 5 words)
      const wordCount = updateTitleDto.title.trim().split(/\s+/).length;
      if (wordCount > 10) {
        throw new BadRequestException('Title must not exceed 10 words');
      }
      
      // Check if session exists and belongs to user
      const session = await this.memoryService.getSession(sessionId, userId);
      
      if (!session) {
        throw new ForbiddenException(
          'Session not found or you do not have access to it',
        );
      }
      
      // Update the session title
      const success = await this.memoryService.updateSessionTitle(
        sessionId,
        userId,
        updateTitleDto.title,
      );
      
      if (!success) {
        throw new InternalServerErrorException('Failed to update session title');
      }
      
      return { 
        success: true, 
        message: 'Session title updated successfully' 
      };
    } catch (error) {
      this.logger.error(`Error updating session title: ${error.message}`);
      throw error;
    }
  }

  @Post('chat')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Chat with the AI' })
  @ApiResponse({
    status: 200,
    description: 'Message processed successfully',
    type: ChatResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to access this session',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  @ApiBody({ type: ChatRequestDto })
  async chat(
    @Body() chatDto: ChatRequestDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {
      const userId = req.user?.userId;
      const { sessionId, message } = chatDto;

      // Create session if not provided or check if existing session belongs to user
      let finalSessionId = sessionId;

      if (finalSessionId) {
        // Check if session exists and belongs to user
        const session = await this.memoryService.getSession(
          finalSessionId,
          userId,
        );
        if (!session) {
          return res.status(HttpStatus.FORBIDDEN).json({
            error: 'Forbidden',
            message: 'Session not found or you do not have access to it',
          });
        }
      } else {
        // Create new session
        finalSessionId = await this.memoryService.createSession(userId);
      }

      // Process chat with AI service (handles message storage internally)
      const result = await this.aiService.chat(
        userId,
        finalSessionId,
        message
      );

      // Generate title for new sessions
      if (!sessionId) {
        this.aiService.generateSessionTitle(finalSessionId, message).then(title => {
          this.memoryService.updateSession(finalSessionId, userId, title).catch(err => {
            this.logger.error(`Error updating session title: ${err.message}`);
          });
        }).catch(err => {
          this.logger.error(`Error generating title: ${err.message}`);
        });
      }

      return res.status(HttpStatus.OK).json({
        sessionId: finalSessionId,
        response: result.message,
        toolCalls: result.toolCalls || [],
        toolResults: [],
        responseId: finalSessionId,
      });
    } catch (error) {
      this.logger.error(`Error in chat: ${error.message}`);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to process message',
        message: error.message,
      });
    }
  }


  @Post('chat/stream')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Chat with the AI using Responses API streaming' })
  @ApiResponse({
    status: 200,
    description:
      'Message processed successfully as a stream using the Responses API',
    type: 'text/event-stream',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not authorized to access this session',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  @ApiBody({ type: ChatRequestDto })
  async chatStreamResponses(
    @Body() chatDto: ChatRequestDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {
      this.logger.log('Starting streaming chat request with Responses API');

      // Set status code to 200 for SSE streaming
      res.status(200);

      // Set headers for SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Transfer-Encoding', 'chunked');
      res.setHeader('X-Accel-Buffering', 'no');

      // Add proxy-related headers
      res.setHeader('X-No-Buffering', 'yes'); // Custom header some proxies respect
      res.removeHeader('Content-Length'); // Ensure no content-length is set

      // Add CORS headers to ensure cross-domain streaming works
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization',
      );
      res.setHeader('Access-Control-Max-Age', '86400');

      res.flushHeaders();
      this.logger.log('Headers flushed');

      const userId = req.user?.userId;
      const { sessionId, message } = chatDto;

      // Create session if not provided or check if existing session belongs to user
      let finalSessionId = sessionId;

      if (finalSessionId) {
        // Check if session exists and belongs to user
        const session = await this.memoryService.getSession(
          finalSessionId,
          userId,
        );
        if (!session) {
          return res.status(HttpStatus.FORBIDDEN).json({
            error: 'Forbidden',
            message: 'Session not found or you do not have access to it',
          });
        }
      } else {
        // Create new session
        finalSessionId = await this.memoryService.createSession(userId);
        // Send sessionId to the client right away so frontend can store it
        this.writeSSE(res, {
          type: 'sessionInfo',
          content: {
            sessionId: finalSessionId,
          },
        });
      }

      // Process streaming chat
      try {
        const stream = this.aiService.chatStream(
          userId,
          finalSessionId,
          message
        );

        // Stream the responses
        for await (const chunk of stream) {
          res.write(chunk);
        }

        // Generate title for new sessions
        if (!sessionId) {
          this.aiService.generateSessionTitle(finalSessionId, message).then(title => {
            this.memoryService.updateSession(finalSessionId, userId, title).catch(err => {
              this.logger.error(`Error updating session title: ${err.message}`);
            });
          }).catch(err => {
            this.logger.error(`Error generating title: ${err.message}`);
          });
        }

        res.end();
      } catch (error) {
        this.logger.error(`Error in streaming chat: ${error.message}`);
        // Send error event and close stream
        this.writeSSE(res, {
          type: 'error',
          content: { message: error.message },
        });
        res.end();
      }
    } catch (error) {
      this.logger.error(`Error in streaming chat setup: ${error.message}`);
      // In case of setup error, send regular JSON response
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to process message',
        message: error.message,
      });
    }
  }

  // TODO: Implement Chat Completions streaming endpoint
  /*
  @Post('chat/stream/completions')
  @UseGuards(JwtGuard)
  @ApiOperation({
    summary: 'Chat with the AI using Chat Completions API streaming response',
  })
  @ApiBody({ type: ChatRequestDto })
  async chatStreamCompletions(
    @Body() chatDto: ChatRequestDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    // Define finalSessionId at the top level of the function
    let finalSessionId: string | undefined;

    try {
      this.logger.log(
        'Starting streaming chat request with Chat Completions API',
      );

      // Set status code to 200 for SSE streaming
      res.status(200);

      // Set up SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Transfer-Encoding', 'chunked');
      res.setHeader('X-Accel-Buffering', 'no');

      // Add proxy-related headers
      res.setHeader('X-No-Buffering', 'yes'); // Custom header some proxies respect
      res.removeHeader('Content-Length'); // Ensure no content-length is set

      // Add CORS headers to ensure cross-domain streaming works
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization',
      );
      res.setHeader('Access-Control-Max-Age', '86400');

      res.flushHeaders();
      this.logger.log('Headers flushed');

      const userId = req.user?.userId;
      const { sessionId, message } = chatDto;

      this.logger.log(
        `Processing stream request: sessionId=${sessionId}, message="${message}", walletAddress=${walletAddress}`,
      );

      // Create session if not provided or check if existing session belongs to user
      finalSessionId = sessionId;

      if (finalSessionId) {
        // Check if session exists and belongs to user
        const session = await this.memoryService.getSession(
          finalSessionId,
          userId,
        );
        if (!session) {
          this.logger.warn(`Session not found: ${finalSessionId}`);
          res.end();
          return;
        }
      } else {
        // Create new session
        this.logger.log(`Creating new session for user ${userId}`);
        finalSessionId = await this.memoryService.createSession(userId);
        this.logger.log(`Created new session: ${finalSessionId}`);

        // Send sessionId to the client right away so frontend can store it
        this.writeSSE(res, {
          type: 'sessionInfo',
          content: {
            sessionId: finalSessionId,
          },
        });
      }

      // Store user message
      await this.memoryService.addMemory({
        userId,
        sessionId: finalSessionId,
        role: 'user',
        content: {
          text: message,
          source: 'direct',
        },
      });
      this.logger.log(`Stored user message in memory`);

      // Get chat history
      const history = await this.memoryService.getFormattedSessionHistory(
        finalSessionId,
        userId,
      );

      this.logger.log(`Retrieved chat history: ${history.length} messages`);

      // Add system prompt with context
      const systemPrompt = this.aiService.createSystemMessage(walletAddress);
      const contextMessages: ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: systemPrompt,
        } as ChatCompletionSystemMessageParam,
        ...history,
      ];

      // Create a buffer to store the response text
      let responseText = '';
      let toolCalls = [];
      let toolResults = [];
      let responseId = '';

      this.logger.log(
        `Starting OpenAI streaming request with Chat Completions API`,
      );

      // Process streaming query - using the ChatCompletions stream method
      await this.aiService.processQueryStreamCompletions(
        contextMessages,
        userId,
        walletAddress,
        {
          onMessage: (chunk) => {
            // Send the chunk to the client
            this.logger.debug(
              `Streaming message chunk: ${JSON.stringify(chunk)}`,
            );
            this.writeSSE(res, chunk);
          },
          onToolCall: (toolCall) => {
            // Add the tool call to our list
            toolCalls.push(toolCall);
            // Send the tool call to the client
            this.logger.log(`Streaming tool call: ${toolCall.name}`);
            this.writeSSE(res, {
              type: 'ToolCall',
              content: {
                id: toolCall.id,
                name: toolCall.name,
                params: toolCall.arguments,
              },
            });
          },
          onToolResult: (toolResult) => {
            // Add the tool result to our list
            toolResults.push(toolResult);
            // Send the tool result to the client
            this.logger.log(
              `Streaming tool result for: ${toolResult.tool_call_id}`,
            );
            this.writeSSE(res, {
              type: 'ToolResult',
              content: {
                id: toolResult.tool_call_id,
                name:
                  toolCalls.find((tc) => tc.id === toolResult.tool_call_id)
                    ?.name || '',
                result: toolResult.output,
              },
            });
          },
          onComplete: (text, id) => {
            // Save the full text and response ID
            responseText = text;
            responseId = id;
            this.logger.log(
              `Stream complete, full text length: ${text.length}`,
            );
          },
          onError: (error) => {
            this.logger.error(`Streaming error: ${error.message}`, error.stack);
            this.writeSSE(res, {
              type: 'error',
              content: error.message,
              ...(finalSessionId ? { sessionId: finalSessionId } : {}),
            });
          },
        },
      );
      this.logger.log(`OpenAI streaming request completed`);

      // Store assistant response with tool calls if any
      await this.memoryService.addMemory({
        userId,
        sessionId: finalSessionId,
        role: 'assistant',
        content: {
          text: responseText,
          source: 'direct',
        },
        metadata: {
          toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        },
      });
      this.logger.log(`Stored assistant response in memory`);

      // Store tool results as separate messages
      if (toolResults.length > 0 && toolCalls.length > 0) {
        for (const toolResult of toolResults) {
          await this.aiProcessingQueue.add(AIJobName.ProcessUserAction, { 
            toolResult, 
            toolCalls, 
            userId 
          });
          await this.memoryService.addMemory({
            userId,
            sessionId: finalSessionId,
            role: 'tool',
            content: {
              text: toolResult.output,
              source: 'tool',
            },
            metadata: {
              toolCallId: toolResult.tool_call_id,
              name:
                toolCalls.find((tc) => tc.id === toolResult.tool_call_id)
                  ?.name || '',
            },
          });
        }
      }

      // TODO: Implement title generation
      // Title generation will be handled after streaming is complete

      // End the response stream
      this.logger.log(`Ending stream response`);
      res.end();
    } catch (error) {
      this.logger.error(`Error in chat stream: ${error.message}`, error.stack);
      // Try to send error if response hasn't been sent yet
      try {
        this.writeSSE(res, {
          type: 'error',
          content: `Failed to process message: ${error.message}`,
          ...(finalSessionId ? { sessionId: finalSessionId } : {}),
        });
        res.end();
      } catch (e) {
        // If headers are already sent, just end the response
        try {
          res.end();
        } catch (endError) {
          this.logger.error(`Error ending stream: ${endError.message}`);
        }
      }
    }
  }

  */
}
