import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { AIController } from './controllers/ai.controller';
import { AiService } from './services/ai.service';
import { MemoryService } from './services/memory.service';
import { Memory, MemorySchema } from './schemas/memory.schema';
import { UserModule } from '../user/user.module';
import { EncryptService } from 'src/shared/services/encrypt/encrypt.service';
import { RedisService } from 'src/shared/services/redis.service';

@Module({
  imports: [
    ConfigModule,
    ThrottlerModule.forRoot({
      throttlers: [{
        ttl: 60000, // 60 seconds in milliseconds
        limit: 10, // 10 requests per minute for chat
      }]
    }),
    MongooseModule.forFeature([
      { name: Memory.name, schema: MemorySchema },
    ]),
    UserModule, // Import UserModule to access UserService
  ],
  controllers: [AIController],
  providers: [AiService, MemoryService, EncryptService, RedisService],
  exports: [AiService, MemoryService],
})
export class AIModule {}