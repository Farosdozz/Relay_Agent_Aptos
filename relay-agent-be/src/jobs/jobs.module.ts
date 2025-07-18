import { DynamicModule, ForwardReference, Module, Type } from '@nestjs/common';
import { UserModule } from '../modules/user/user.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bullmq';
import { bullQueues } from '../common/constants';
import { ScheduleModule } from '@nestjs/schedule';
import { TokenSaleCrawlModule } from './token-sale-crawl/token-sale-crawl.module';

@Module({})
export class JobsModule {
  static forRoot(): DynamicModule {
    const imports: (
      | DynamicModule
      | Type<any>
      | Promise<DynamicModule>
      | ForwardReference<any>
    )[] = [
      ScheduleModule.forRoot(),
      BullModule.registerQueue(...bullQueues),
      UserModule,
      TokenSaleCrawlModule,
      EventEmitterModule.forRoot(),
    ];

    return {
      module: JobsModule,
      imports,
    };
  }
}
