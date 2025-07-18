import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export class AuthTwitterLoginDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  codeVerifier: string;
}

export class CreateTwitterUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty()
  @Exclude()
  accessToken: string;

  @ApiProperty()
  @Exclude()
  validUntil: Date;

  @ApiProperty()
  @Exclude()
  refreshToken: string;

  constructor(partial: any) {
    Object.assign(this, partial);
  }
}
