import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { AwsKmsService } from './services/aws/aws-kms.service';
import { AwsS3Service } from './services/aws/aws-s3.service';
import { RedisService } from './services/redis.service';
import { AvatarService } from './services/avatar/avatar.service';
import { EncryptService } from './services/encrypt/encrypt.service';
import { CacheModule } from '@nestjs/cache-manager';
import { redisOptions } from 'src/common/constants';
import * as redisStore from 'cache-manager-redis-store';

const providers = [
  AwsKmsService,
  AwsS3Service,
  RedisService,
  AvatarService,
  EncryptService,
];

const modules = [
  HttpModule,
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
];

@Global()
@Module({
  providers,
  imports: modules,
  exports: [...providers, ...modules],
})
export class SharedModule {}
