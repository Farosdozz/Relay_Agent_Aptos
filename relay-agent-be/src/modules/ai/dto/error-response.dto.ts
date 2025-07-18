import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    description: 'Error type',
    example: 'BadRequest',
  })
  error: string;

  @ApiProperty({
    description: 'Error message',
    example: 'Invalid request parameters',
  })
  message: string;
}