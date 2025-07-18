export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

export interface MessageContent {
  text: string;
  attachments?: any[];
  source?: string;
  inReplyTo?: string;
}

export interface ToolCallMetadata {
  toolName: string;
  args: Record<string, any>;
  result?: any;
  error?: string;
  executionTime?: number;
  transactionHash?: string;
}

export interface MemoryMessage {
  userId: string;
  sessionId: string;
  role: MessageRole;
  content: MessageContent;
  metadata?: Record<string, any>;
  synced?: boolean;
}

export interface ConversationHistory {
  messages: Array<{
    role: string;
    content: string;
    name?: string;
  }>;
  totalMessages: number;
}