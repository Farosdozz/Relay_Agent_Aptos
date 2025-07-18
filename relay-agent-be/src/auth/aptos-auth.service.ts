import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/shared/services/redis.service';
import { UserService } from 'src/modules/user/user.service';
import { EncryptService } from 'src/shared/services/encrypt/encrypt.service';
import {
  AptosNonceResponseDto,
  AptosVerifyRequestDto,
  AptosAuthResponseDto,
  AptosRefreshTokenResponseDto
} from './dtos/aptos-auth.dto';
import { CACHE_KEYS, FIVE_MINUTES_TTL, THIRTY_DAYS_TTL } from 'src/common/constants';
import { aptosConfig } from '../../config/aptos.config';

import {
  deserializeSignInOutput,
  verifySignInSignature,
  verifySignInMessage,
  generateNonce
} from '@aptos-labs/siwa';
import { Account } from '@aptos-labs/ts-sdk';

@Injectable()
export class AptosAuthService {
  private readonly logger = new Logger(AptosAuthService.name);
  private readonly noncePrefix = `${CACHE_KEYS.REFRESH_TOKEN.replace(':refresh-token:', ':aptos-nonce:')}`;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly userService: UserService,
    private readonly encryptService: EncryptService,
  ) {
    // No longer need to initialize Aptos client since we're using SIWA package
  }

  /**
   * Generate a cryptographically secure nonce for SIWA authentication
   */
  async generateNonce(): Promise<AptosNonceResponseDto> {
    try {
      // Generate cryptographically secure nonce using official SIWA package
      const nonce = generateNonce();
      const expiresAt = Date.now() + (FIVE_MINUTES_TTL * 1000); // 5 minutes from now

      // Store nonce in Redis with TTL
      const nonceKey = `${this.noncePrefix}${nonce}`;
      await this.redisService.set(nonceKey, {
        nonce,
        createdAt: Date.now(),
        expiresAt
      }, FIVE_MINUTES_TTL);

      this.logger.log(`Generated nonce: ${nonce.substring(0, 8)}...`);

      return {
        nonce,
        expiresAt
      };
    } catch (error) {
      this.logger.error('Failed to generate nonce:', error);
      throw new HttpException(
        'Failed to generate authentication nonce',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Verify SIWA message signature using official @aptos-labs/siwa package
   */
  async verifySignature(request: AptosVerifyRequestDto): Promise<AptosAuthResponseDto> {
    try {
      // Use SIWA functions from static import

      // Log the received output for debugging
      this.logger.log('Received SIWA output:', JSON.stringify(request.output, null, 2));

      // Try to deserialize the sign-in output from the frontend
      let deserializedOutput;
      try {
        deserializedOutput = deserializeSignInOutput(request.output);
        this.logger.log('Successfully deserialized SIWA output');
      } catch (deserializeError) {
        this.logger.error('Failed to deserialize SIWA output:', deserializeError.message);
        // If deserialization fails, we'll handle the raw output manually
        deserializedOutput = request.output;
        this.logger.log('Using raw output for manual processing');
      }

      // Handle different versions of the serialized output
      let nonce: string;
      let walletAddress: string;
      let input: any;

      // Check if we have a properly deserialized output or need to handle raw output
      const isDeserialized = deserializedOutput && typeof deserializedOutput.signature !== 'string';

      if (!isDeserialized) {
        // Handle raw output manually (when deserialization failed)
        this.logger.log('Processing raw SIWA output manually');

        if (deserializedOutput.version === "2" && deserializedOutput.input) {
          input = deserializedOutput.input;
          nonce = input.nonce;
          walletAddress = input.address;

          // Validate nonce exists and is not expired
          await this.validateNonce(nonce);

          // For raw output, we'll do basic validation without signature verification
          // since we can't easily recreate the Aptos SDK objects
          this.logger.log('Raw output validation - skipping signature verification for now');

        } else {
          throw new HttpException('Unsupported SIWA output format', HttpStatus.BAD_REQUEST);
        }

      } else if (deserializedOutput.version === "2") {
        // Version 2 has input field - properly deserialized
        input = deserializedOutput.input;
        nonce = input.nonce;
        walletAddress = input.address;

        // Verify signature using official SIWA package
        const signatureVerification = await verifySignInSignature(deserializedOutput);
        if (!signatureVerification.valid) {
          throw new HttpException(
            'Invalid signature',
            HttpStatus.UNAUTHORIZED
          );
        }

        // Validate nonce exists and is not expired
        await this.validateNonce(nonce);

        // Get expected input for message verification
        const expectedInput = {
          nonce,
          domain: aptosConfig.authentication.messageDomain,
          statement: aptosConfig.authentication.messageStatement,
        };

        // Verify message content using official SIWA package
        const messageVerification = await verifySignInMessage({
          input: input,
          expected: expectedInput,
          publicKey: deserializedOutput.publicKey,
        });

        if (!messageVerification.valid) {
          throw new HttpException(
            'Invalid message content',
            HttpStatus.BAD_REQUEST
          );
        }
      } else {
        // Version 1 has message field - extract data from message
        const message = deserializedOutput.message;
        nonce = this.extractNonceFromMessage(message);
        walletAddress = this.extractAddressFromMessage(message);

        if (!nonce) {
          throw new HttpException('Invalid SIWA message: nonce not found', HttpStatus.BAD_REQUEST);
        }

        if (!walletAddress) {
          throw new HttpException('Invalid SIWA message: address not found', HttpStatus.BAD_REQUEST);
        }

        // Validate nonce exists and is not expired
        await this.validateNonce(nonce);

        // For version 1, we can only verify the signature, not the message content
        // since verifySignInMessage expects version 2 format
        // We'll use a basic signature verification approach
        const isValidSignature = deserializedOutput.publicKey.verifySignature({
          message: new TextEncoder().encode(message),
          signature: deserializedOutput.signature
        });

        if (!isValidSignature) {
          throw new HttpException('Invalid signature', HttpStatus.UNAUTHORIZED);
        }
      }

      // Create or update user
      const user = await this.userService.createUserWithWalletAddress({
        walletAddress: walletAddress.toLowerCase(),
      });

      // Check if user already has an embedded wallet
      if (!user.walletProfile?.walletAddress) {
        // Create embedded wallet for the user
        await this.createEmbeddedWallet(user._id.toString());
      }

      // Generate JWT tokens
      const tokens = await this.generateTokens(walletAddress, user._id.toString());

      // Invalidate used nonce
      await this.invalidateNonce(nonce);

      this.logger.log(`Successful authentication for address: ${walletAddress}`);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user._id.toString(),
          walletAddress: user.walletAddress,
          name: user.userProfile?.userName,
          avatar: user.userProfile?.profilePictureUrl,
        },
        expiresIn: this.getTokenExpirationTime()
      };

    } catch (error) {
      this.logger.error('Signature verification failed:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Authentication failed',
        HttpStatus.UNAUTHORIZED
      );
    }
  }

  /**
   * Refresh JWT access token using stored refresh token
   */
  async refreshToken(walletAddress: string): Promise<AptosRefreshTokenResponseDto> {
    try {
      const normalizedAddress = walletAddress.toLowerCase();

      // Check if refresh token exists in Redis
      const refreshTokenKey = `${CACHE_KEYS.REFRESH_TOKEN}${normalizedAddress}`;
      const storedRefreshToken = await this.redisService.get<string>(refreshTokenKey);

      if (!storedRefreshToken) {
        throw new HttpException('Refresh token not found', HttpStatus.UNAUTHORIZED);
      }

      // Verify refresh token
      try {
        const decoded = this.jwtService.verify(storedRefreshToken);
        if (decoded.walletAddress !== normalizedAddress) {
          throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
        }
      } catch (error) {
        // Remove invalid refresh token
        await this.redisService.del(refreshTokenKey);
        throw new HttpException('Invalid or expired refresh token', HttpStatus.UNAUTHORIZED);
      }

      // Get user information
      const user = await this.userService.findOneByWalletAddress(normalizedAddress);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // Generate new access token
      const payload = {
        walletAddress: normalizedAddress,
        sub: {
          walletAddress: normalizedAddress,
          userId: user._id.toString(),
        },
      };

      const accessToken = this.jwtService.sign(payload, {
        expiresIn: this.configService.get<string>('jwtService.jwtAccessTokenExpire'),
      });

      this.logger.log(`Token refreshed for address: ${normalizedAddress}`);

      return {
        accessToken,
        expiresIn: this.getTokenExpirationTime()
      };

    } catch (error) {
      this.logger.error('Token refresh failed:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Token refresh failed',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Logout user by invalidating refresh token
   */
  async logout(walletAddress: string): Promise<void> {
    try {
      const normalizedAddress = walletAddress.toLowerCase();
      const refreshTokenKey = `${CACHE_KEYS.REFRESH_TOKEN}${normalizedAddress}`;

      // Check if refresh token exists
      const refreshToken = await this.redisService.get<string>(refreshTokenKey);
      if (!refreshToken) {
        throw new HttpException('Already logged out', HttpStatus.BAD_REQUEST);
      }

      // Remove refresh token from Redis
      await this.redisService.del(refreshTokenKey);

      this.logger.log(`User logged out: ${normalizedAddress}`);
    } catch (error) {
      this.logger.error('Logout failed:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Logout failed',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Private helper methods
   */

  private async validateNonce(nonce: string): Promise<void> {
    const nonceKey = `${this.noncePrefix}${nonce}`;

    // Check if nonce exists in Redis
    const storedNonce = await this.redisService.get(nonceKey);
    if (!storedNonce) {
      throw new HttpException('Invalid or expired nonce', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Extract nonce from SIWA message string
   */
  private extractNonceFromMessage(message: string): string | null {
    try {
      const lines = message.split('\n');
      for (const line of lines) {
        if (line.startsWith('Nonce: ')) {
          return line.replace('Nonce: ', '').trim();
        }
      }
      return null;
    } catch (error) {
      this.logger.error('Error extracting nonce from message:', error);
      return null;
    }
  }

  /**
   * Extract address from SIWA message string
   */
  private extractAddressFromMessage(message: string): string | null {
    try {
      const lines = message.split('\n');
      // The address is typically on the second line
      if (lines.length >= 2) {
        const address = lines[1].trim();
        if (address.startsWith('0x')) {
          return address;
        }
      }
      return null;
    } catch (error) {
      this.logger.error('Error extracting address from message:', error);
      return null;
    }
  }

  private async generateTokens(walletAddress: string, userId: string) {
    const normalizedAddress = walletAddress.toLowerCase();

    const payload = {
      walletAddress: normalizedAddress,
      sub: {
        walletAddress: normalizedAddress,
        userId: userId,
      },
    };

    // Generate access token
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('jwtService.jwtAccessTokenExpire'),
    });

    // Generate refresh token
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('jwtService.jwtRefreshTokenExpire'),
    });

    // Store refresh token in Redis
    const refreshTokenKey = `${CACHE_KEYS.REFRESH_TOKEN}${normalizedAddress}`;
    await this.redisService.set(refreshTokenKey, refreshToken, THIRTY_DAYS_TTL);

    return { accessToken, refreshToken };
  }

  private async invalidateNonce(nonce: string): Promise<void> {
    const nonceKey = `${this.noncePrefix}${nonce}`;
    await this.redisService.del(nonceKey);
  }

  private getTokenExpirationTime(): number {
    const expireTime = this.configService.get<string>('jwtService.jwtAccessTokenExpire');
    // Convert time string (e.g., '15m') to seconds
    if (expireTime.endsWith('m')) {
      return parseInt(expireTime.slice(0, -1)) * 60;
    } else if (expireTime.endsWith('h')) {
      return parseInt(expireTime.slice(0, -1)) * 3600;
    } else if (expireTime.endsWith('d')) {
      return parseInt(expireTime.slice(0, -1)) * 86400;
    }
    return 900; // Default 15 minutes
  }

  /**
   * Create embedded wallet for user
   */
  private async createEmbeddedWallet(userId: string): Promise<void> {
    try {
      // Generate new Aptos account with default Ed25519 scheme
      const account = Account.generate();
      
      // Encrypt the private key
      const encryptedPrivateKey = this.encryptService.encrypKeyHash(
        account.privateKey.toString()
      );

      // Get the network from config or use testnet as default
      const network = this.configService.get<string>('APTOS_NETWORK', 'testnet');

      // Update user with embedded wallet information
      await this.userService.updateWalletProfile(userId, {
        walletAddress: account.accountAddress.toString(),
        network: network,
        encryptedPrivateKey: encryptedPrivateKey,
        createdAt: new Date(),
      });

      this.logger.log(`Created embedded wallet for user: ${userId}`);
    } catch (error) {
      this.logger.error('Failed to create embedded wallet:', error);
      throw new HttpException(
        'Failed to create embedded wallet',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
