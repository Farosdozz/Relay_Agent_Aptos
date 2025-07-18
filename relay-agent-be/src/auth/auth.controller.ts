import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { AptosAuthService } from './aptos-auth.service';
import { UserService } from 'src/modules/user/user.service';
import { JwtGuard } from './guards/jwt-auth.guard';
import { AuthTwitterLoginDto, CreateTwitterUserDto } from './dtos/twitterDto';
import { AuthTwitterService } from './twitter.service';
import { ConfigService } from '@nestjs/config';

import {
  AptosNonceResponseDto,
  AptosVerifyRequestDto,
  AptosAuthResponseDto,
  AptosRefreshTokenResponseDto,
} from './dtos/aptos-auth.dto';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private aptosAuthService: AptosAuthService,
    private twitterService: AuthTwitterService,
    private userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  // @Get('nonce')
  // async getNonce() {
  //   return await this.authService.getNonce();
  // }

  // @Post('login')
  // async login(@Body() body: LoginRequestDto) {
  //   return await this.authService.login(body);
  // }

  // @UseGuards(RefreshJwtGuard)
  // @Post('refresh')
  // async refreshToken(@Request() req: any, @Body() body: RefreshTokenDto) {
  //   return this.authService.refreshToken(req.user.walletAddress);
  // }

  // @UseGuards(PrivyAuthGuard)
  // @Post('logout')
  // async logout(@Request() req: any) {
  //   return await this.authService.logout(req.user.walletAddress);
  // }



  // @UseGuards(PrivyAuthGuard)
  // @ApiOperation({ summary: 'Logout from Privy session' })
  // @Post('privy/logout')
  // async privyLogout(@Request() req: any) {
  //   return await this.privyService.logout(req.user.walletAddress);
  // }

  // @UseGuards(PrivyAuthGuard)
  // @ApiOperation({ summary: 'Refresh token for Privy authenticated user' })
  // @Post('privy/refresh')
  // async privyRefreshToken(@Request() req: any) {
  //   return this.privyService.refreshToken(req.user.walletAddress);
  // }

  // Connect Twitter
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Connects twitter account to existed user' })
  @ApiQuery({
    name: 'callbackUrl',
    required: false,
    type: String,
    example: 'https://app.relay-agent.io/auth/twitter/callback',
    description:
      'Custom callback URL for Twitter OAuth. If not provided, will use default callback URL',
  })
  @Post('twitter/connect')
  async twitterConnectCallback(
    @Request() req: any,
    @Body() loginDto: AuthTwitterLoginDto,
    @Query() query: { callbackUrl?: string },
  ) {
    const profile = await this.twitterService.getProfileByCode(
      loginDto,
      query.callbackUrl,
    );
    if (!profile) {
      return {
        status: 400,
        message: 'Invalid code',
      };
    }

    const walletAddress = req.user.walletAddress;
    const twitterDto = new CreateTwitterUserDto(profile);

    return this.userService.updateUserWithTwitter(walletAddress, {
      twitterId: twitterDto.id,
      name: twitterDto.name,
      username: twitterDto.username,
      accessToken: twitterDto.accessToken,
      refreshToken: twitterDto.refreshToken,
    });
  }

  // Disconnect twitter account from existed user
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Disconnect twitter account from existed user' })
  @Post('twitter/disconnect')
  async twitterDisconnect(@Request() req: any) {
    const walletAddress = req.user.walletAddress;

    return this.userService.removeTwitterProfile(walletAddress);
  }

  @ApiOperation({ summary: 'Get Twitter auth URL' })
  @ApiQuery({
    name: 'callbackUrl',
    required: false,
    type: String,
    example: 'https://app.relay-agent.io/auth/twitter/callback',
    description:
      'Custom callback URL for Twitter OAuth. If not provided, will use default callback URL',
  })
  @Get('twitter')
  async twitterConnect(
    @Req() req: any,
    @Query() query: { callbackUrl?: string },
  ) {
    const params = new URLSearchParams();
    const twitterClientId = this.configService.get<string>(
      'authService.TWITTER_CLIENT_ID',
    );

    // Use provided callbackUrl or fall back to default
    const defaultCallbackUrl = `${this.configService.get<string>('authService.BASE_URL')}/auth/twitter/callback`;
    const callbackURL = query.callbackUrl || defaultCallbackUrl;

    const twitterScopes = 'tweet.read users.read like.read follows.read';
    params.append('response_type', 'code');
    params.append('client_id', twitterClientId);
    params.append('redirect_uri', callbackURL);
    params.append('scope', twitterScopes);
    params.append('state', 'state');
    params.append('code_challenge', 'challenge');
    params.append('code_challenge_method', 'plain');

    const urlConnect =
      'https://twitter.com/i/oauth2/authorize?' + params.toString();
    return { url: urlConnect };
  }

  // ===== APTOS AUTHENTICATION ENDPOINTS =====

  /**
   * Generate nonce for SIWA authentication
   */
  @Get('aptos/nonce')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @UseGuards(ThrottlerGuard)
  @ApiOperation({
    summary: 'Generate authentication nonce',
    description: 'Generates a cryptographically secure nonce for Sign-in with Aptos (SIWA) authentication',
  })
  @ApiResponse({
    status: 200,
    description: 'Nonce generated successfully',
    type: AptosNonceResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Too many nonce requests - rate limit exceeded',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getAptosNonce(): Promise<AptosNonceResponseDto> {
    try {
      this.logger.log('Generating nonce for SIWA authentication');
      const result = await this.aptosAuthService.generateNonce();
      this.logger.log('Nonce generated successfully');
      return result;
    } catch (error) {
      this.logger.error('Failed to generate nonce:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to generate authentication nonce',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Verify SIWA signature and authenticate user
   */
  @Post('aptos/verify')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify SIWA signature',
    description: 'Verifies the signed SIWA message and authenticates the user',
  })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful',
    type: AptosAuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data or SIWA message format',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication failed - invalid signature or expired nonce',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many verification attempts - rate limit exceeded',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async verifyAptosSignature(
    @Body() verifyRequest: AptosVerifyRequestDto,
  ): Promise<AptosAuthResponseDto> {
    try {
      this.logger.log('Verifying SIWA signature and message');
      const result = await this.aptosAuthService.verifySignature(verifyRequest);
      this.logger.log('Authentication successful');
      return result;
    } catch (error) {
      this.logger.error('Authentication failed', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Authentication failed',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /**
   * Refresh JWT access token for Aptos users
   */
  @Post('aptos/refresh')
  @Throttle({ default: { limit: 20, ttl: 3600000 } }) // 20 requests per hour
  @UseGuards(JwtGuard, ThrottlerGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Generates a new access token using the stored refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: AptosRefreshTokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or expired refresh token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many token refresh attempts - rate limit exceeded',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async refreshAptosToken(@Request() req: any): Promise<AptosRefreshTokenResponseDto> {
    try {
      const walletAddress = req.user.walletAddress;
      this.logger.log(`Refreshing token for address: ${walletAddress}`);
      const result = await this.aptosAuthService.refreshToken(walletAddress);
      this.logger.log(`Token refreshed successfully for address: ${walletAddress}`);
      return result;
    } catch (error) {
      this.logger.error(`Token refresh failed for address: ${req.user?.walletAddress}`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Token refresh failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Logout Aptos user and invalidate refresh token
   */
  @Post('aptos/logout')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Logout user',
    description: 'Invalidates the user session by removing the refresh token',
  })
  @ApiResponse({
    status: 204,
    description: 'Logout successful',
  })
  @ApiResponse({
    status: 400,
    description: 'Already logged out',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async logoutAptos(@Request() req: any): Promise<void> {
    try {
      const walletAddress = req.user.walletAddress;
      this.logger.log(`Logging out user: ${walletAddress}`);
      await this.aptosAuthService.logout(walletAddress);
      this.logger.log(`User logged out successfully: ${walletAddress}`);
    } catch (error) {
      this.logger.error(`Logout failed for address: ${req.user?.walletAddress}`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Logout failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
