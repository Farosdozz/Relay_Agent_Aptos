import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserRepository } from './user.repository';
import { AvatarService } from 'src/shared/services/avatar/avatar.service';
import { CacheModule } from '@nestjs/cache-manager';
import { redisOptions } from 'src/common/constants';
import * as redisStore from 'cache-manager-redis-store';
import { AuthModule } from 'src/auth/auth.module';
import { User, UserSchema } from './user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
    forwardRef(() => AuthModule),
    CacheModule.registerAsync({
      useFactory: async () => {
        return {
          ttl: 30, // 30 seconds
          store: redisStore,
          ...redisOptions,
          isGlobal: true,
        };
      },
    }),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    { useClass: UserRepository, provide: 'UserRepositoryInterface' },
    AvatarService,
  ],
  exports: [UserService],
})
export class UserModule {}
