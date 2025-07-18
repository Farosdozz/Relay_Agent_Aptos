import { ApiProperty } from '@nestjs/swagger';
import { PaginationMeta } from './pagination.dto';

class ToolCallDto {
  @ApiProperty({
    description: 'Unique identifier for the tool call',
    example: 'call_abc123',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the function called',
    example: 'get_wallet_balance',
  })
  name: string;

  @ApiProperty({
    description: 'Arguments passed to the function',
    example: '{"token":"APT"}',
  })
  arguments: string;
}

class ToolResultDto {
  @ApiProperty({
    description: 'ID of the tool call this result belongs to',
    example: 'call_abc123',
  })
  tool_call_id: string;

  @ApiProperty({
    description: 'Output from the tool execution',
    example: '{"balance": 15.5, "symbol": "APT"}',
  })
  output: string;
}

export class ChatResponseDto {
  @ApiProperty({
    description: 'Session ID',
    example: '624a86ec8b25e31c9be3fc3d',
  })
  sessionId: string;

  @ApiProperty({
    description: 'AI assistant response',
    example:
      'Your APT balance is 15.5 APT. Is there anything else you would like to know?',
  })
  response: string;

  @ApiProperty({
    description: 'List of tool calls made by the AI',
    type: [ToolCallDto],
    required: false,
  })
  toolCalls?: ToolCallDto[];

  @ApiProperty({
    description: 'Results of the tool calls',
    type: [ToolResultDto],
    required: false,
  })
  toolResults?: ToolResultDto[];

  @ApiProperty({
    description: 'Response ID for reference',
    required: false,
    example: 'resp_67ccd2bed1ec8190b14f964abc0542670bb6a6b452d3795b',
  })
  responseId?: string;
  
  @ApiProperty({
    description: 'Web search metadata if web search was used',
    required: false,
    type: 'object',
    example: {
      id: 'ws_67c9fa0502748190b7dd390736892e100be649c1a5ff9609',
      status: 'completed'
    }
  })
  webSearch?: {
    id: string;
    status: string;
  } | null;
}

export class SessionDto {
  @ApiProperty({
    description: 'Session ID',
    example: '624a86ec8b25e31c9be3fc3d',
  })
  sessionId: string;

  @ApiProperty({
    description: 'Session title',
    example: 'Balance Inquiry',
  })
  title: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-08-15T10:30:45.123Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-08-15T10:35:12.456Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Preview of the last message',
    required: false,
    type: Object,
  })
  lastMessage?: {
    role: string;
    content: string;
  };
}

export class SessionListResponseDto {
  @ApiProperty({
    description: 'List of chat sessions',
    type: [SessionDto],
  })
  sessions: SessionDto[];
}

/**
 * DTO for paginated sessions list response
 */
export class PaginatedSessionListResponseDto extends SessionListResponseDto {
  @ApiProperty({
    description: 'Pagination metadata',
    example: {
      totalItems: 100,
      itemsPerPage: 10,
      totalPages: 10,
      currentPage: 1,
      hasNextPage: true,
      hasPrevPage: false,
    },
  })
  pagination: PaginationMeta;
}

export class SessionResponseDto {
  @ApiProperty({
    description: 'Session details',
    type: SessionDto,
  })
  session: SessionDto;
}

export class MessageDto {
  @ApiProperty({
    description: 'Role of the conversation participant',
    enum: ['system', 'user', 'assistant', 'tool'],
    example: 'user',
  })
  role: string;

  @ApiProperty({
    description: 'Message content',
    type: Object,
  })
  content: {
    text: string;
    attachments?: any[];
    source?: string;
    inReplyTo?: string;
  };

  @ApiProperty({
    description: 'Metadata',
    type: Object,
    required: false,
  })
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-08-15T10:30:45.123Z',
  })
  createdAt: Date;
}

export class MessagesResponseDto {
  @ApiProperty({
    description: 'List of messages in the session',
    type: [MessageDto],
  })
  messages: MessageDto[];
}