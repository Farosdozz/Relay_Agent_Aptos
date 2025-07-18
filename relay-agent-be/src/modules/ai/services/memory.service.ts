import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types as MongooseTypes } from 'mongoose';
import { Memory, MemoryDocument } from '../schemas/memory.schema';
import {
  ChatCompletionMessageParam,
} from 'openai/resources/chat/completions';

interface SessionMetadata {
  sessionId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessage: {
    role: string;
    content: string;
  } | null;
}

@Injectable()
export class MemoryService {
  private readonly logger = new Logger(MemoryService.name);

  constructor(
    @InjectModel(Memory.name) private memoryModel: Model<MemoryDocument>,
  ) {}

  /**
   * Creates a new chat session
   */
  async createSession(userId: string, title?: string): Promise<string> {
    const sessionId = new MongooseTypes.ObjectId().toString();

    // Store the initial system message with session metadata
    await this.memoryModel.create({
      userId,
      sessionId,
      role: 'system',
      content: {
        text: title || 'New Conversation',
        source: 'system',
      },
      metadata: { isSessionMetadata: true },
    });

    return sessionId;
  }

  /**
   * Update session title
   */
  async updateSession(sessionId: string, userId: string, title: string): Promise<void> {
    await this.memoryModel.updateOne(
      {
        sessionId,
        userId,
        role: 'system',
        'metadata.isSessionMetadata': true
      },
      {
        $set: {
          'content.text': title,
          updatedAt: new Date()
        }
      }
    );
  }

  /**
   * Lists all chat sessions for a user
   * @param userId - The user ID
   * @param pagination - Optional pagination parameters (page, limit, sort, order)
   * @returns An object containing the paginated sessions and total count
   */
  async listSessions(
    userId: string, 
    pagination?: { page: number; limit: number; sort: string; order: 'asc' | 'desc' }
  ): Promise<{ sessions: any[]; total: number }> {
    try {
      // Default pagination values
      const { 
        page = 1, 
        limit = 10, 
        sort = 'updatedAt', 
        order = 'desc' 
      } = pagination || {};
      
      // Calculate skip value for pagination
      const skip = (page - 1) * limit;
      
      // Create sort options
      let sortField = 'createdAt';
      if (sort === 'updatedAt') {
        // Special handling for updatedAt since it's not a direct field
        sortField = 'createdAt'; // We'll sort by createdAt as fallback
      } else if (sort === 'title') {
        sortField = 'content.text';
      }
      
      const sortOrder = order === 'asc' ? 1 : -1;
      
      // Count total number of sessions for pagination metadata
      const totalCount = await this.memoryModel.countDocuments({
        userId,
        'metadata.isSessionMetadata': true,
      });
      
      // Get paginated sessions
      const sessions = await this.memoryModel
        .aggregate([
          {
            $match: {
              userId,
              'metadata.isSessionMetadata': true,
            },
          },
          { $sort: { [sortField]: sortOrder } },
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              sessionId: 1,
              title: '$content.text',
              createdAt: 1,
              _id: 0,
            },
          },
        ])
        .exec();
      
      // For each session, get the latest message timestamp for updatedAt
      const sessionsWithUpdatedAt = await Promise.all(
        sessions.map(async (session) => {
          const latestMessage = await this.memoryModel
            .findOne({
              sessionId: session.sessionId,
              userId,
              role: { $in: ['user', 'assistant'] }, // Only include user and assistant roles, exclude tool
              'metadata.isSessionMetadata': { $ne: true },
            })
            .sort({ createdAt: -1 })
            .lean()
            .exec();
            
          return {
            ...session,
            updatedAt: latestMessage 
              ? (latestMessage as any).createdAt 
              : session.createdAt,
            lastMessage: latestMessage
              ? {
                  role: latestMessage.role,
                  content:
                    latestMessage.content.text.substring(0, 100) +
                    (latestMessage.content.text.length > 100 ? '...' : ''),
                }
              : null,
          };
        })
      );
      
      // If sorting by updatedAt, we need to sort the results after fetching
      if (sort === 'updatedAt') {
        sessionsWithUpdatedAt.sort((a, b) => {
          const aTime = new Date(a.updatedAt).getTime();
          const bTime = new Date(b.updatedAt).getTime();
          return order === 'asc' ? aTime - bTime : bTime - aTime;
        });
      }
      
      return {
        sessions: sessionsWithUpdatedAt,
        total: totalCount,
      };
    } catch (error) {
      this.logger.error(`Error in listSessions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Gets session details by ID
   * 
   * @param sessionId The ID of the session to retrieve
   * @param userId The ID of the user who owns the session
   * @param options Optional parameters for customizing the response
   * @param options.includeLatestMessage Whether to include the latest message (defaults to true)
   * @returns The session metadata or null if not found
   */
  async getSession(
    sessionId: string,
    userId: string,
    options?: { includeLatestMessage?: boolean }
  ): Promise<SessionMetadata | null> {
    const includeLatestMessage = options?.includeLatestMessage !== false; // Default to true if not specified
    
    const sessionMetadata = await this.memoryModel
      .findOne({
        sessionId,
        userId,
        'metadata.isSessionMetadata': true,
      })
      .lean()
      .exec();

    if (!sessionMetadata) {
      return null;
    }

    // Only fetch the latest message if includeLatestMessage is true
    let latestMessage = null;
    
    if (includeLatestMessage) {
      latestMessage = await this.memoryModel
        .findOne({
          sessionId,
          userId,
          role: { $in: ['user', 'assistant'] },
          'metadata.isSessionMetadata': { $ne: true },
        })
        .sort({ createdAt: -1 })
        .lean()
        .exec();
    }

    return {
      sessionId,
      title: sessionMetadata.content.text,
      createdAt: (sessionMetadata as any).createdAt,
      updatedAt: latestMessage
        ? (latestMessage as any).createdAt
        : (sessionMetadata as any).createdAt,
      lastMessage: latestMessage
        ? {
            role: latestMessage.role,
            content:
              latestMessage.content.text.substring(0, 100) +
              (latestMessage.content.text.length > 100 ? '...' : ''),
          }
        : null,
    };
  }

  /**
   * Adds a new memory entry
   */
  async addMemory(memory: Partial<Memory>): Promise<Memory> {
    return this.memoryModel.create(memory);
  }

  /**
   * Get all memories for a session with optional limit
   */
  async getSessionMemories(
    sessionId: string,
    userId: string,
    options?: { limit?: number }
  ): Promise<Memory[]> {
    const query = this.memoryModel
      .find({
        sessionId,
        userId,
        'metadata.isSessionMetadata': { $ne: true }, // Exclude session metadata
      })
      .sort({ createdAt: 1 });
    
    // Apply limit if provided
    if (options?.limit) {
      query.limit(options.limit);
    }
    
    return query.exec();
  }

  /**
   * Formats session messages for the OpenAI API
   */
  async getFormattedSessionHistory(
    sessionId: string,
    userId: string,
  ): Promise<ChatCompletionMessageParam[]> {
    const memories = await this.getSessionMemories(sessionId, userId);
    const formattedMessages: ChatCompletionMessageParam[] = [];
    
    // Handle tool calls directly by restructuring history
    for (const memory of memories) {
      // Skip system metadata messages if any
      if (memory.metadata?.isSessionMetadata) {
        continue;
      }
      
      if (memory.role === 'user' || memory.role === 'system') {
        // Add user and system messages normally
        formattedMessages.push({
          role: memory.role,
          content: memory.content.text,
        });
      } else if (memory.role === 'assistant') {
        // Format assistant message, with optional tool_calls embedded in content
        if (memory.metadata?.toolCalls?.length > 0) {
          // For assistant messages with tool calls, use a flattened approach
          formattedMessages.push({
            role: 'assistant',
            content: memory.content.text,
          });
          
          // Instead of adding tool calls and responses separately, we'll handle them during retrieval
        } else {
          // Regular assistant message without tool calls
          formattedMessages.push({
            role: 'assistant',
            content: memory.content.text,
          });
        }
      }
      // Tool messages are intentionally not included for OpenAI API
      // They will be accessible through the regular memory retrieval methods
    }

    return formattedMessages;
  }

  /**
   * Updates a session title
   * @param sessionId The session ID
   * @param userId The user ID
   * @param title The new title
   * @returns A promise that resolves to true if the update was successful
   */
  async updateSessionTitle(
    sessionId: string,
    userId: string,
    title: string,
  ): Promise<boolean> {
    const result = await this.memoryModel
      .updateOne(
        {
          sessionId,
          userId,
          'metadata.isSessionMetadata': true,
        },
        { 'content.text': title },
      )
      .exec();
    
    // Return true if at least one document was modified
    return result.modifiedCount > 0;
  }

  /**
   * Deletes a chat session and all its messages
   */
  async deleteSession(sessionId: string, userId: string): Promise<void> {
    // Only delete memories belonging to the specified user for security
    await this.memoryModel
      .deleteMany({
        sessionId,
        userId,
      })
      .exec();
  }

}
