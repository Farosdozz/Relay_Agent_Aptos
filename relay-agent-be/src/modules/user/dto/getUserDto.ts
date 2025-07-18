import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEthereumAddress,
  IsNumber,
  IsNumberString,
  IsString,
} from 'class-validator';

export class GetDetailUserByAddressDto {
  @ApiProperty({ type: String })
  @IsString()
  address: string;
}

export class GetUserByAddressDto {
  @ApiProperty({ type: String })
  @IsString()
  address: string;
}

export class GetProfilePictureDto {
  @ApiProperty({ type: 'string', required: true })
  @IsEthereumAddress()
  walletAddress: string;
}
