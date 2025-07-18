import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TokenSaleCrawlService } from './token-sale-crawl.service';
import { TokenSaleCrawlCronService } from './token-sale-crawl.cron';
import { QueueName, CACHE_PREFIX, DEFAULT_JOB_OPTIONS } from 'src/common/constants';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QueueName.TOKEN_SALE,
      prefix: CACHE_PREFIX,
      defaultJobOptions: DEFAULT_JOB_OPTIONS
    }),
  ],
  providers: [TokenSaleCrawlService, TokenSaleCrawlCronService],
  exports: [TokenSaleCrawlService],
})
export class TokenSaleCrawlModule {}
