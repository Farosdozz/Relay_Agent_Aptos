export enum MessageRole {
  User = 'user',
  Assistant = 'assistant',
  System = 'system',
  Tool = 'tool',
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string | any;
  createdAt: string;
  tools?: ToolCall[]; // Array of tool calls and results
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: string; // JSON string of arguments
  result?: string; // JSON string of result
}

export interface Session {
  sessionId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: any;
}

export interface ChatRequest {
  sessionId?: string;
  message: string;
  walletAddress?: string;
}

export enum StreamResponseType {
  Message = 'Message',
  ToolCall = 'ToolCall',
  ToolResult = 'ToolResult',
  SessionInfo = 'sessionInfo',
  Error = 'Error',
}

/**
 * Stream response interface for different message types in the streaming API
 */
export interface StreamResponse {
  type: StreamResponseType;
  content: string | { [key: string]: any };
}

/**
 * Tool call specific information
 */
export interface ToolCallContent {
  id: string;
  name: string;
  params: { [key: string]: any };
}

/**
 * Tool result specific information
 */
export interface ToolResultContent {
  id: string;
  result: any;
}

/**
 * Pagination information from API response
 */
export interface PaginationInfo {
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Sessions response with pagination metadata
 */
export interface SessionsResponse {
  sessions: Session[];
  pagination: PaginationInfo;
}

export interface Tool {
  id: string;
  name: string;
  arguments: string;
  result?: string;
}
