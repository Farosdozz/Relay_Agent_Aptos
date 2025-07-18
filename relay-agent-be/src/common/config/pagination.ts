import { IsNumber, Min, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { createParamDecorator } from '@nestjs/common';

export class PaginationParams {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @Type(() => String)
  @IsString()
  orderby?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sort?: number = -1; // descending
}

export function paginateResponse(data, totalCount, page, limit, orderby, sort) {
  return {
    data: data,
    total: totalCount,
    currentPage: page,
    limit: limit,
    maxpage: Math.ceil(totalCount / limit),
    orderby: orderby,
    sort: sort,
  };
}
