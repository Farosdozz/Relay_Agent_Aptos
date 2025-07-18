import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEthereumAddress,
  IsNumber,
  IsNumberString,
  IsObject,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { USER_NAME_REGEX, USER_REF_CODE_REGEX } from 'src/common/constants';
import { WalletProfile } from '../user.schema';

export class UpdateUserRefreshTokenDto {
  @ApiProperty({ type: String })
  @IsString()
  walletAddress: string;

  @ApiProperty({ type: String })
  @IsString()
  refreshToken: string;
}

export class CreateUserFirstLoginDto {
  @ApiProperty({ type: String })
  @IsString()
  walletAddress: string;

  @ApiProperty({ type: Object, required: false })
  @IsOptional()
  @IsObject()
  walletProfile?: WalletProfile;
}

export class RemoveUserRefreshTokenDto {
  @ApiProperty({ type: String })
  @IsString()
  walletAddress: string;
}

export class UpdateRefCodeOfOneUserDto {
  @ApiProperty({
    type: String,
    maxLength: 9,
    minLength: 9,
    pattern: USER_REF_CODE_REGEX,
  })
  @Matches(USER_REF_CODE_REGEX)
  @IsString()
  refCode: string;
}

export class UpdateRefByOfOneUserDto {
  @ApiProperty({
    type: String,
    maxLength: 9,
    minLength: 9,
    pattern: USER_REF_CODE_REGEX,
  })
  @Matches(USER_REF_CODE_REGEX)
  @IsString()
  refBy: string;
}

export class UpdateUserNameDto {
  @ApiProperty({
    type: String,
    maxLength: 25,
    minLength: 3,
    pattern: USER_NAME_REGEX,
  })
  @Matches(USER_NAME_REGEX)
  @IsString()
  userName: string;
}

export class CreateUserWithTwitterDto {
  @ApiProperty({ type: String })
  @IsString()
  twitterId: string;

  @ApiProperty({ type: String })
  @IsString()
  username: string;

  @ApiProperty({ type: String })
  @IsString()
  name?: string;

  @ApiProperty({ type: String })
  @IsString()
  profileImageUrl?: string;

  @ApiProperty({ type: String })
  @IsString()
  accessToken: string;

  @ApiProperty({ type: String })
  @IsString()
  refreshToken: string;
}
