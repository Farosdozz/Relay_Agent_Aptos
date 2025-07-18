// health.module.ts
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { AwsKmsService } from './shared/services/aws/aws-kms.service';
import { AwsS3Service } from './shared/services/aws/aws-s3.service';
import { AvatarService } from './shared/services/avatar/avatar.service';
import { CacheModule } from '@nestjs/cache-manager';
import { redisOptions } from './common/constants';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    TerminusModule,
    CacheModule.registerAsync({
      useFactory: async () => {
        return {
          ttl: 300, // 5 minutes
          store: redisStore,
          ...redisOptions,
          isGlobal: true,
        };
      },
    }),
  ],
  controllers: [HealthController],
  providers: [AwsKmsService, AwsS3Service, AvatarService],
})
export class HealthModule {}
