import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsNumberString,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ type: String })
  @IsString()
  walletAddress: string;

  @ApiProperty({ type: Boolean, required: false })
  @IsBoolean()
  isKOL?: boolean;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
