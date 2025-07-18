import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/modules/user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt-strategy';
import { RefreshJwtStrategy } from './strategies/refreshToken.strategy';
import { AuthTwitterService } from './twitter.service';

import { AptosAuthService } from './aptos-auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserRepository } from 'src/modules/user/user.repository';
import { UserSchema } from 'src/modules/user/user.schema';
import { User } from 'src/modules/user/user.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
    PassportModule,
    forwardRef(() => UserModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwtService.jwtSecretKey'),
        signOptions: {
          expiresIn: configService.get<string>(
            'jwtService.jwtAccessTokenExpire',
          ),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    AptosAuthService,
    JwtStrategy,
    RefreshJwtStrategy,
    AuthTwitterService,
    {
      provide: 'UserRepositoryInterface',
      useClass: UserRepository,
    },
  ],
  controllers: [AuthController],
  exports: [AuthService, AptosAuthService, AuthTwitterService],
})
export class AuthModule {}
