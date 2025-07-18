import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, MaxLength, Matches } from 'class-validator';

export class ChatRequestDto {
  @ApiProperty({
    description:
      'Chat session ID (optional, new session will be created if not provided)',
    example: '624a86ec8b25e31c9be3fc3d',
    required: false,
  })
  @IsString()
  @IsOptional()
  sessionId?: string;

  @ApiProperty({
    description: 'Message to send to the AI',
    example: 'What is my APT balance?',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description: 'Optional wallet address for blockchain operations',
    example: '0x1234...abcd',
    required: false,
  })
  @IsString()
  @IsOptional()
  walletAddress?: string;
}

export class CreateSessionDto {
  @ApiProperty({
    description: 'Optional title for the new chat session',
    example: 'Balance Inquiry',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;
}

export class UpdateSessionTitleDto {
  @ApiProperty({
    description: 'New title for the chat session (maximum 10 words)',
    example: 'APT Balance Inquiry Session',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^(\S+\s*){1,10}$/, {
    message: 'Title must not exceed 10 words',
  })
  title: string;
}