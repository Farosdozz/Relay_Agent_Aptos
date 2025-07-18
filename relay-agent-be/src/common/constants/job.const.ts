import { RegisterQueueOptions } from '@nestjs/bullmq';
import { CACHE_PREFIX, DEFAULT_JOB_OPTIONS } from './cache.const';

export enum QueueName {
  TOKEN_SALE = 'token-sale',
  GENERAL = 'queue',
}

export const bullQueues: RegisterQueueOptions[] = Object.values(QueueName).map(
  (name) => ({ 
    name,
    prefix: CACHE_PREFIX,
    defaultJobOptions: DEFAULT_JOB_OPTIONS
  }),
);

// enum job name
export enum EJobName {
  // token
  TOKEN_SALE_CRAWL = 'token-sale-crawl',
}

export interface IRefreshLeaderbroadJobData {}
