import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TokenSaleCrawlService } from './token-sale-crawl.service';

@Injectable()
export class TokenSaleCrawlCronService {
  private readonly logger = new Logger(TokenSaleCrawlCronService.name);

  constructor(private readonly tokenSaleCrawlService: TokenSaleCrawlService) {}

  @Cron('*/5 * * * * *')
  async handleCron() {
    try {
      // await this.tokenSaleCrawlService.cron(); // TODO: uncomment this
    } catch (error) {
      this.logger.error(
        'Error token sale crawl cron::' + JSON.stringify(error),
      );
    }
  }
}
