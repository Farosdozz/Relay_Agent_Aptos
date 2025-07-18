import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for handling pagination query parameters
 */
export class PaginationQueryDto {
  @ApiProperty({ 
    required: false, 
    default: 1, 
    description: 'Page number (starts from 1)'
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ 
    required: false, 
    default: 10, 
    description: 'Number of items per page (max 100)'
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({ 
    required: false, 
    default: 'updatedAt', 
    description: 'Field to sort by'
  })
  @IsOptional()
  @IsString()
  sort?: string = 'updatedAt';

  @ApiProperty({ 
    required: false, 
    enum: ['asc', 'desc'], 
    default: 'desc', 
    description: 'Sort direction'
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';
}

/**
 * Interface for pagination metadata in responses
 */
export interface PaginationMeta {
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}