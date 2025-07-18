import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { TwitterApi } from 'twitter-api-v2';
import { AuthTwitterLoginDto } from './dtos/twitterDto';

@Injectable()
export class AuthTwitterService {
  logger = new Logger(AuthTwitterService.name);
  clientID = '';
  clientSecret = '';
  callbackURL = '';

  constructor(
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.clientID = this.configService.get<string>(
      'authService.TWITTER_CLIENT_ID',
    );
    this.clientSecret = this.configService.get<string>(
      'authService.TWITTER_CLIENT_SECRET',
    );
    this.callbackURL = `${configService.get<string>('authService.BASE_URL')}/auth/twitter/callback`;
  }

  private async exchangeTokens(
    { code, codeVerifier }: AuthTwitterLoginDto,
    callbackUrl?: string,
  ) {
    return new TwitterApi({
      clientId: this.clientID,
      clientSecret: this.clientSecret,
    })
      .loginWithOAuth2({
        code,
        codeVerifier,
        redirectUri: callbackUrl ? callbackUrl : this.callbackURL,
      })
      .catch((e) => {
        this.logger.error('Twitter verify failed', e);
        throw new HttpException(e, HttpStatus.BAD_REQUEST);
      });
  }

  private async getUserInfo(client: TwitterApi) {
    return client.v2.me().catch((e) => {
      this.logger.error('Twitter get user info failed', e);
      throw new HttpException(e, HttpStatus.BAD_REQUEST);
    });
  }

  async getProfileByCode(loginDto: AuthTwitterLoginDto, callbackUrl?: string) {
    try {
      const tokens = await this.exchangeTokens(loginDto, callbackUrl);
      const { data: profile } = await this.getUserInfo(tokens.client);

      return {
        ...tokens,
        ...profile,
      };
    } catch (e) {
      this.logger.error(e);
      // Handle Twitter API specific errors
      if (e.response?.data) {
        const { error_description, error } = e.response.data;
        throw new HttpException(
          error_description || `Twitter API Error: ${error}`,
          e.status || HttpStatus.BAD_REQUEST,
        );
      }

      // Handle other types of errors
      throw new HttpException(
        e.message || 'An error occurred while processing Twitter profile',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
