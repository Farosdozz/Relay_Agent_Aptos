import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, IsString } from 'class-validator';
import { isAddress } from 'ethers/lib/utils';

class LoginRequestDto {
  @ApiProperty()
  @IsString()
  @IsEthereumAddress()
  walletAddress: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty()
  @IsString()
  signedMessage: string;

  @ApiProperty()
  @IsString()
  nonce: string;
}

class LogoutDto {
  @ApiProperty()
  @IsString()
  walletAddress: string;
}

class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refresh: string;
}

export { LoginRequestDto, LogoutDto, RefreshTokenDto };
