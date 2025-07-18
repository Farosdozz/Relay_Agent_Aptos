import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CACHE_KEYS, EJobName, QueueName } from 'src/common/constants';
import { RedisService } from 'src/shared/services/redis.service';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class TokenSaleCrawlService {
  private readonly logger = new Logger(TokenSaleCrawlService.name);
  private isCrawling = false;

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    @InjectQueue(QueueName.TOKEN_SALE)
    private readonly tokenSaleQueue: Queue,
  ) {}

  async cron(): Promise<void> {
    this.logger.log('TokenSaleCrawlService::cron::start');
    if (this.isCrawling) {
      this.logger.log('Already crawling, skipping...');
      return;
    }

    this.isCrawling = true;
    try {
      await this.processHandle();
    } catch (error) {
      this.logger.error('TokenSaleCrawlService::cron::error', error);
    } finally {
      this.isCrawling = false;
      this.logger.log('TokenSaleCrawlService::cron::end');
    }
  }

  private async processHandle(): Promise<void> {
    try {
      // TODO: Implement the logic to process
    } catch (error) {
      this.logger.error(`Error processing:`, error);
      throw error;
    }
  }
}
