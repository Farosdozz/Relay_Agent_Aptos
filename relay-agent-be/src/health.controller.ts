import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
} from '@nestjs/terminus';
import { AvatarService } from './shared/services/avatar/avatar.service';
import { RedisService } from './shared/services/redis.service';

@Controller()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly avatarService: AvatarService,
    private readonly redisService: RedisService,
  ) {}

  @Get('health')
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    console.log(
      `Heap used: ${process.memoryUsage().heapUsed / (1024 * 1024)} mb`,
    );
    return this.health.check([]);
  }
}
