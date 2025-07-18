import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import base from '../config/base.config';
import blockchain from '../config/blockchain.config';
import auth from '../config/auth.config';
import awsKms from './shared/services/aws/aws-kms.config';
import rateLimit from '../config/rate-limit.config';
import { UserModule } from './modules/user/user.module';
import * as Joi from 'joi';
import { AuthModule } from './auth/auth.module';
import { SharedModule } from './shared/shared.module';
import { HealthModule } from './health.module';
import { CACHE_PREFIX, DEFAULT_JOB_OPTIONS, redisOptions } from './common/constants';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { JobsModule } from './jobs/jobs.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { AIModule } from './modules/ai/ai.module';

const envValidationSchema = {
  PORT: Joi.number().default(3000),
  JWT_SECRET: Joi.string(),
  JWT_ACCESS_TOKEN_EXPIRE: Joi.string(),
  JWT_REFRESH_TOKEN_EXPIRE: Joi.string(),
  OPENAI_API_KEY: Joi.string().required(),
};

const GlobalConfigs = [base, blockchain, awsKms, auth, rateLimit];
@Module({
  imports: [
    ConfigModule.forRoot({
      load: GlobalConfigs,
      isGlobal: true,
      validationSchema: Joi.object(envValidationSchema),
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    BullModule.forRoot({
      prefix: CACHE_PREFIX,
      connection: {
        ...redisOptions,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        enableOfflineQueue: true, // Enable offline queue to handle temporary disconnections
        connectTimeout: 30000,
        retryStrategy: (times) => {
          // Exponential backoff with max delay of 10 seconds
          return Math.min(Math.pow(2, times) * 500, 10000);
        },
      },
      // Global default job options
      defaultJobOptions: DEFAULT_JOB_OPTIONS,
    }),
    PrometheusModule.register({
      path: '/metrics',
    }),
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          {
            name: 'default',
            ttl: 60000, // 1 minute
            limit: 20, // 20 requests per minute
          },
        ],
        storage: new ThrottlerStorageRedisService({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT) || 6379,
          password: process.env.REDIS_PASSWORD,
          db: parseInt(process.env.REDIS_DB) || 0,
        }),
      }),
    }),

    MongooseModule.forRoot(process.env.MONGODB_URI),
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),
    ScheduleModule.forRoot(),
    JobsModule.forRoot(),
    SharedModule,
    AuthModule,
    UserModule,
    HealthModule,
    AIModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
