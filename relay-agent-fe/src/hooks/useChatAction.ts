import { QUERY_KEY } from '@/constants/query';
import { useAuthMutation } from '@/hooks/useAuthQuery';
import {
  ChatRequest,
  Message,
  MessageRole,
  Session,
  StreamResponse,
  StreamResponseType,
  Tool,
} from '@/interfaces/chat.interface';
import { apiBackend } from '@/utils/axios';
import { useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

// Helper function to parse SSE chunks (assumed to exist or be defined elsewhere)
// This should handle potentially incomplete JSON objects in the buffer
declare function parseSSEChunk(buffer: string): StreamResponse[];

// The new streaming function using fetch
export const streamChatCompletion = async (
  request: ChatRequest,
  onMessage: (data: StreamResponse) => void,
  onError: (error: any) => void,
  onComplete: () => void,
) => {
  let controller: AbortController | null = null;
  try {
    controller = new AbortController();
    const signal = controller.signal;

    // Get the current auth token and ensure it's a string
    const authHeader = apiBackend.defaults.headers.common['Authorization'];
    const authToken = typeof authHeader === 'string' ? authHeader : '';

    // Log the request we're sending
    console.log('Streaming request payload:', JSON.stringify(request));

    const response = await fetch(`${apiBackend.defaults.baseURL}/ai/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken, // Ensure Authorization header is correct
      },
      body: JSON.stringify(request),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No reader available for the response body.');
    }

    const decoder = new TextDecoder();
    let buffer = ''; // Buffer for potentially incomplete SSE messages

    // Function to process the buffer for complete SSE messages
    const processBuffer = () => {
      let boundaryIndex;
      // SSE messages are separated by double newlines (\n\n)
      while ((boundaryIndex = buffer.indexOf('\n\n')) >= 0) {
        const messageString = buffer.substring(0, boundaryIndex).trim();
        buffer = buffer.substring(boundaryIndex + 2); // Move past the boundary

        if (messageString.startsWith('data: ')) {
          try {
            const jsonStr = messageString.substring(6); // Remove 'data: '
            if (jsonStr) {
              const data = JSON.parse(jsonStr);
              if (data && typeof data === 'object' && 'type' in data && 'content' in data) {
                // Basic validation, could be more robust
                if (
                  ['Message', 'ToolCall', 'ToolResult', 'sessionInfo', 'Error'].includes(data.type)
                ) {
                  onMessage(data as StreamResponse);
                } else {
                  console.warn('Unknown stream message type:', data.type);
                }
              } else {
                console.warn('Invalid stream message format:', data);
              }
            }
          } catch (e) {
            console.warn('Failed to parse SSE JSON:', messageString, e);
          }
        }
      }
    };

    // Read the stream
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // Process any remaining data in the buffer when the stream ends
        processBuffer();
        break;
      }
      buffer += decoder.decode(value, { stream: true }); // Decode chunk and add to buffer
      processBuffer(); // Process buffer for complete messages
    }

    // Signal completion after the stream is fully read
    onComplete();

    return controller; // Return the controller
  } catch (error) {
    // Don't call onComplete here if an error occurred during streaming
    console.error('Streaming API error:', error);
    onError(error); // Signal error
    if (controller) {
      controller.abort(); // Abort the fetch request if it's still active
    }
    return null; // Indicate failure
  }
};

export const useChatAction = () => {
  const queryClient = useQueryClient();

  const createNewSession = useAuthMutation<{ sessionId: string }, string, AxiosError>(
    (title) => apiBackend.post('/ai/sessions', { title }).then((res) => res.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY.SESSIONS] });
      },
    },
  );

  // sendMessage mutation using the new streamChatCompletion function
  const sendMessage = useAuthMutation<
    void, // No specific success data needed, handled via callbacks
    ChatRequest & {
      // Request includes chat data and callbacks
      onStream?: (data: StreamResponse) => void;
      onError?: (error: any) => void;
      onComplete?: () => void;
      currentSession?: Session | null;
      setCurrentSession?: (session: Session | null) => void; // Allow setting session to null
      setMessages?: React.Dispatch<React.SetStateAction<Message[]>>;
    },
    AxiosError // Keep AxiosError for consistency? Or change to generic Error?
  >(
    async (chatRequest) => {
      const {
        onStream,
        onError = (err) => console.error('Default onError:', err), // Default handlers
        onComplete,
        currentSession,
        setCurrentSession,
        setMessages,
        // Extract the core chat request fields
        message,
        sessionId: initialSessionId, // Rename to avoid conflict
        walletAddress,
      } = chatRequest;

      // --- Prepare Placeholders and Local State ---
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: MessageRole.User,
        content: message,
        createdAt: new Date().toISOString(),
      };

      const assistantMessagePlaceholder: Message = {
        id: crypto.randomUUID(),
        role: MessageRole.Assistant,
        content: '',
        createdAt: new Date().toISOString(),
        tools: [],
      };

      // Add placeholders immediately if setMessages is available
      if (setMessages) {
        setMessages((prev: Message[]) => [...prev, userMessage, assistantMessagePlaceholder]);
      }

      const assistantMessageId = assistantMessagePlaceholder.id;
      let toolCalls: Tool[] = []; // Local state for tools during this stream
      let currentSessionId = initialSessionId || currentSession?.sessionId || '';
      const isNewSession = !currentSessionId;

      // --- Call the Streaming Function ---
      await streamChatCompletion(
        // Pass the core request data
        {
          message,
          sessionId: currentSessionId,
          walletAddress,
        },
        // onMessage callback (handles stream data)
        (data: StreamResponse) => {
          // Call the original onStream callback if provided
          if (onStream) {
            onStream(data);
          }

          // Update local state (messages, session) based on stream type
          if (setMessages) {
            setMessages((prev: Message[]) => {
              // Use map to create a new array, ensuring immutability
              return prev.map((msg) => {
                // Find the assistant message by its placeholder ID
                if (msg.id === assistantMessageId) {
                  let updatedMsg = { ...msg }; // Clone the message

                  switch (data.type) {
                    case StreamResponseType.Message:
                      if (typeof data.content === 'string') {
                        // Simple append, UI layer might need smarter logic for duplicate chunks
                        updatedMsg.content = (updatedMsg.content || '') + data.content;
                        // Also ensure tools state is preserved during content updates
                        updatedMsg.tools = [...toolCalls];
                      }
                      break;

                    case StreamResponseType.ToolCall:
                      if (typeof data.content === 'object') {
                        const toolData = data.content as any;
                        const newToolCall: Tool = {
                          id:
                            toolData.id ||
                            `call_${Date.now()}${Math.random().toString(36).substring(2, 7)}`,
                          name: toolData.name || '',
                          arguments: JSON.stringify(toolData.params || {}),
                          result: '',
                        };
                        // Update local tool state
                        toolCalls = [
                          ...toolCalls.filter((t) => t.id !== newToolCall.id),
                          newToolCall,
                        ];
                        // Update message's tools array
                        updatedMsg.tools = [...toolCalls];
                      }
                      break;

                    case StreamResponseType.ToolResult:
                      if (typeof data.content === 'object' && 'id' in data.content) {
                        const resultData = data.content as { id: string; result: any };
                        // Update local tool state
                        toolCalls = toolCalls.map((t) =>
                          t.id === resultData.id
                            ? {
                                ...t,
                                result:
                                  resultData.result !== undefined
                                    ? typeof resultData.result === 'object'
                                      ? JSON.stringify(resultData.result)
                                      : String(resultData.result)
                                    : '',
                              }
                            : t,
                        );
                        // Update message's tools array
                        updatedMsg.tools = [...toolCalls];
                      }
                      break;

                    case StreamResponseType.SessionInfo:
                      // Handle session update if needed (and if setCurrentSession is available)
                      if (
                        isNewSession &&
                        typeof data.content === 'object' &&
                        'sessionId' in data.content &&
                        setCurrentSession
                      ) {
                        const sessionContent = data.content as { sessionId: string };
                        if (sessionContent.sessionId) {
                          console.log('Received new session ID:', sessionContent.sessionId);
                          currentSessionId = sessionContent.sessionId; // Update local session ID tracker
                          const newSessionData: Session = {
                            sessionId: sessionContent.sessionId,
                            title: message.slice(0, 50), // Use original message for title
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                          };
                          setCurrentSession(newSessionData);
                          // Update context/state via callback
                          // Consider invalidating session list query *after* completion
                        }
                      }
                      break;

                    case StreamResponseType.Error:
                      console.error('Received error in stream:', data.content);
                      // Optionally update message content to show error
                      updatedMsg.content =
                        (updatedMsg.content || '') + `\n\n⚠️ Error: ${data.content}`;
                      updatedMsg.role = MessageRole.System; // Mark as system error message
                      break;
                  }
                  return updatedMsg; // Return the updated message
                }
                return msg; // Return other messages unchanged
              });
            });
          } // end if(setMessages)
        },
        // onError callback
        (error: any) => {
          console.error('Error from streamChatCompletion:', error);
          if (setMessages) {
            setMessages((prev: Message[]) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      role: MessageRole.System,
                      content: (msg.content || '') + '\n\n⚠️ Error: Failed to complete the stream.',
                    }
                  : msg,
              ),
            );
          }
          onError(error); // Forward the error to the original callback
        },
        // onComplete callback
        () => {
          console.log('Stream completed.');
          if (setMessages) {
            // Final message state update ensures tools are correct
            setMessages((prev: Message[]) =>
              prev.map((msg) =>
                msg.id === assistantMessageId ? { ...msg, tools: [...toolCalls] } : msg,
              ),
            );
          }
          onComplete && onComplete(); // Forward completion to the original callback
        },
      );
    },
    {
      onSuccess: () => {
        console.log('sendMessage mutation function finished execution.');
      },
      onError: (error) => {
        console.error('sendMessage mutation function failed:', error);
      },
    },
  );

  return { createNewSession, sendMessage };
};
