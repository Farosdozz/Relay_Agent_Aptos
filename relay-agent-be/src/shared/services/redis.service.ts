import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';
import { redisOptions } from 'src/common/constants';
@Injectable()
export class RedisService {
  logger = new Logger(RedisService.name);
  private redisClient: Redis;
  constructor() {
    this.logger.log(
      `Connecting to Redis at ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    );
    this.redisClient = new Redis(redisOptions);

    this.redisClient.on('error', (err) => {
      this.logger.error('Redis connection error:', err);
    });

    this.redisClient.on('connect', () => {
      this.logger.log('Successfully connected to Redis');
    });
  }

  getRedisClient() {
    return this.redisClient;
  }

  // GET operation
  async get<T>(key: string): Promise<T | null> {
    const value = await this.redisClient.get(key);
    return value ? this.deserializeValue<T>(value) : null;
  }

  // SET operation
  async set<T>(key: string, value: T, ttl?: number): Promise<string | null> {
    const serializedValue = this.serializeValue(value);
    return ttl
      ? this.redisClient.set(key, serializedValue, 'EX', ttl)
      : this.redisClient.set(key, serializedValue);
  }

  // HSET operation
  async hset<T>(key: string, field: string, value: T): Promise<number> {
    const serializedValue = this.serializeValue(value);
    return await this.redisClient.hset(key, field, serializedValue);
  }

  // HGET operation
  async hget<T>(key: string, field: string): Promise<T | null> {
    const value = await this.redisClient.hget(key, field);
    return value ? this.deserializeValue<T>(value) : null;
  }

  // INCR operation
  async incr(key: string): Promise<number> {
    return await this.redisClient.incr(key);
  }

  // DEL operation
  async del(key: string): Promise<number> {
    return await this.redisClient.del(key);
  }

  // SCAN operation (to iterate over keys)
  async scan(pattern: string): Promise<string[]> {
    let cursor = '0';
    let keys: string[] = [];
    do {
      const reply = await this.redisClient.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );
      cursor = reply[0];
      keys.push(...reply[1]);
    } while (cursor !== '0');
    return keys;
  }

  private serializeValue<T>(value: T): string {
    return JSON.stringify(value);
  }

  private deserializeValue<T>(value: string): T {
    return JSON.parse(value);
  }

  errorResponse = 'relay-agent:error-response';
  // cache aside pattern
  async getDataFromCacheOrAPI<T>(
    cacheKey: string,
    apiFunction: () => Promise<T>,
    cacheExpiry: number,
  ) {
    const dataFromCache = await this.redisClient.get(cacheKey);
    const errorDataFromCache = await this.redisClient.get(`error:${cacheKey}`);
    let data;
    if (errorDataFromCache === this.errorResponse) {
      throw new HttpException('data not found', HttpStatus.NOT_FOUND);
    }
    if (dataFromCache) {
      try {
        data = JSON.parse(dataFromCache);
      } catch (error) {
        this.logger.error(error);
      }
    } else {
      try {
        data = await apiFunction();
        if (data) {
          // Cache the fresh data
          this.redisClient.setex(cacheKey, cacheExpiry, JSON.stringify(data));
        }
      } catch (error) {
        this.logger.error(error);
        this.redisClient.setex(
          `error:${cacheKey}`,
          cacheExpiry,
          this.errorResponse,
        );
        throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
      }
    }
    return data;
  }
}
