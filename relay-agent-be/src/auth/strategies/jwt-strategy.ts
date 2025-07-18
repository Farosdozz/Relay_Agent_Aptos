import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService, // <- injected config service here
  ) {
    const jwtSecret = configService.get<string>('jwtService.jwtSecretKey');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    // Extract userId from the sub object if it exists
    // The JWT payload structure from aptos-auth.service.ts includes:
    // {
    //   walletAddress: string,
    //   sub: {
    //     walletAddress: string,
    //     userId: string
    //   }
    // }
    const userId = payload.sub?.userId || payload.userId;
    
    // Return user object with userId field added at the root level
    return { 
      ...payload,
      userId: userId
    };
  }
}
