import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AptosNonceRequestDto {
  @ApiProperty({
    description: 'Optional Aptos address for nonce generation',
    example: '0x1234567890abcdef1234567890abcdef12345678',
    required: false,
  })
  @IsOptional()
  @IsString()
  walletAddress?: string;
}

export class AptosNonceResponseDto {
  @ApiProperty({
    description: 'Generated nonce for SIWA message',
    example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
  })
  @IsString()
  @IsNotEmpty()
  nonce: string;

  @ApiProperty({
    description: 'Nonce expiration timestamp',
    example: 1640995200000,
  })
  @IsNumber()
  expiresAt: number;
}

export class AptosVerifyRequestDto {
  @ApiProperty({
    description: 'Serialized SIWA output from the frontend',
    example: {
      version: "2",
      type: "ed25519",
      signature: "0x1234567890abcdef...",
      input: {
        nonce: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
        domain: "relay-agent.io",
        statement: "I accept the Terms of Service: https://relay-agent.io/terms"
      },
      publicKey: "0xabcdef1234567890..."
    },
  })
  @IsNotEmpty()
  output: any; // SerializedAptosSignInOutput from @aptos-labs/siwa
}

export class AptosAuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  refreshToken: string;

  @ApiProperty({
    description: 'User information',
  })
  user: {
    id: string;
    walletAddress: string;
    name?: string;
    avatar?: string;
  };

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 900,
  })
  @IsNumber()
  expiresIn: number;
}

export class AptosRefreshTokenRequestDto {
  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class AptosRefreshTokenResponseDto {
  @ApiProperty({
    description: 'New JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  accessToken: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 900,
  })
  @IsNumber()
  expiresIn: number;
}

export class AptosLogoutRequestDto {
  @ApiProperty({
    description: 'Aptos address to logout',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;
}
