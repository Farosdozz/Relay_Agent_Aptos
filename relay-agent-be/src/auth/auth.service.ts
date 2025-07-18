import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/modules/user/user.schema';
import { UserService } from 'src/modules/user/user.service';
import { Request } from 'express';
import { generateNonce, SiweMessage } from 'siwe';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';
import { LoginRequestDto, RefreshTokenDto } from './auth.interface';
import { RedisService } from 'src/shared/services/redis.service';
import { CACHE_KEYS, THIRTY_DAYS_TTL } from 'src/common/constants';

@Injectable()
export class AuthService {
  logger = new Logger(AuthService.name);
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.userService.findOneWithUserName(username);
    // if (user && (await bcrypt.compare(password, user.password))) {
    //   const { password, ...result } = user;
    //   return result;
    // }
    return null;
  }

  async getNonce(): Promise<string> {
    const nonce = generateNonce();
    return nonce;
  }

  async login(body: LoginRequestDto) {
    const walletAddress = body.walletAddress.toLowerCase();

    let payload = {
      walletAddress: walletAddress,
      sub: {
        walletAddress: walletAddress,
      },
    };
    const isSignatureValid = await this.isValidSignature(body);
    if (isSignatureValid) {
      const refreshToken = this.jwtService.sign(payload, {
        expiresIn: this.configService.get<string>(
          'jwtService.jwtRefreshTokenExpire',
        ),
      });

      // save refresh token
      this.redisService.set(
        `${CACHE_KEYS.REFRESH_TOKEN}${walletAddress.toLowerCase()}`,
        refreshToken,
        THIRTY_DAYS_TTL,
      );
      const userInfo = await this.userService.createUserFirstLogin({
        walletAddress: walletAddress.toLowerCase(),
      });
      payload.sub['userId'] = userInfo?._id;

      const response = {
        ...body,
        accessToken: this.jwtService.sign(payload, {
          expiresIn: this.configService.get<string>(
            'jwtService.jwtAccessTokenExpire',
          ),
        }),
        refreshToken: refreshToken,
      };

      return response;
    }
  }

  async refreshToken(walletAddress: string) {
    const userRefreshToken = await this.redisService.get(
      `${CACHE_KEYS.REFRESH_TOKEN}${walletAddress.toLowerCase()}`,
    );

    if (!userRefreshToken) {
      throw new HttpException('Logged out', HttpStatus.UNAUTHORIZED);
    }

    const payload = {
      walletAddress: walletAddress,
      sub: {
        walletAddress: walletAddress,
      },
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async logout(walletAddress: string) {
    const userRefreshToken = await this.redisService.get(
      `${CACHE_KEYS.REFRESH_TOKEN}${walletAddress.toLowerCase()}`,
    );
    if (!userRefreshToken) {
      throw new HttpException('Logged out', HttpStatus.UNAUTHORIZED);
    }
    return await this.redisService.set(
      `${CACHE_KEYS.REFRESH_TOKEN}${walletAddress.toLowerCase()}`,
      null,
      1,
    );
  }

  async isValidSignature(body: LoginRequestDto): Promise<boolean> {
    if (!body.message) {
      throw new HttpException('message not found', HttpStatus.NOT_FOUND);
    }
    if (!body.signedMessage) {
      throw new HttpException('signedMessage not found', HttpStatus.NOT_FOUND);
    }
    if (this.isSignatureExpired(body)) {
      throw new HttpException('Signature expired', HttpStatus.BAD_REQUEST);
    }
    const recoveredAddress = ethers.utils.verifyMessage(
      body.message,
      body.signedMessage,
    );
    if (recoveredAddress.toLowerCase() !== body.walletAddress.toLowerCase()) {
      throw new HttpException('Invalid signature', HttpStatus.FORBIDDEN);
    }
    return true;
  }

  isSignatureExpired(body: LoginRequestDto): boolean {
    try {
      const signatureExpiresIn = this.configService.get<number>(
        'authService.signatureExpiresIn',
      );
      const messageTimestamp = Number(body.message.split('timestamp: ')[1]);
      const currentTimestamp = Math.floor(Date.now() / 1000);
      return messageTimestamp + signatureExpiresIn < currentTimestamp;
    } catch (error) {
      this.logger.error(error);
      return true;
    }
  }
}
