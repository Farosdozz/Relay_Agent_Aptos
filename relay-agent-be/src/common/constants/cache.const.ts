import { RedisOptions } from 'ioredis';

export const redisOptions: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  username: process.env.REDIS_USER,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  connectTimeout: 10000, // 10 seconds
  disconnectTimeout: 5000, // 5 seconds
  keepAlive: 5000, // Send keep-alive every 5 seconds
  enableOfflineQueue: true, // Enable offline queue to handle temporary disconnections
  reconnectOnError: (err) => {
    const targetErrors = ['READONLY', 'ETIMEDOUT', 'ECONNREFUSED', 'ECONNRESET', 'EPIPE'];
    for (const errText of targetErrors) {
      if (err.message.includes(errText)) {
        // Reconnect on specific network errors
        console.log(`[Redis] Reconnecting due to error: ${err.message}`);
        return true;
      }
    }
    return false;
  },
  retryStrategy: (times: number) => {
    // Exponential backoff with jitter
    const delay = Math.min(Math.floor(Math.random() * 100) + Math.pow(2, times) * 500, 10000);
    console.log(`[Redis] Connection attempt ${times}, retrying in ${delay}ms`);

    if (times > 10) {
      console.error(`[Redis] Could not connect after ${times} attempts`);
      return null; // Stop retrying after 10 attempts
    }

    return delay;
  },
};

export const DEFAULT_JOB_OPTIONS = {
  attempts: 5,
  backoff: {
    type: 'exponential',
    delay: 5000,
  },
  removeOnComplete: true,
  removeOnFail: { count: 10 },
};

export const HALF_MINUTE_TTL = 30;
export const TWO_MINUTES_TTL = 120;
export const FIFTEEN_MINUTES_TTL = 900;
export const FIVE_MINUTES_TTL = 300;
export const TEN_MINUTES_TTL = 600;
export const ONE_HOUR_TTL = 3600;
export const HALF_DAY_TTL = 43200;
export const SEVEN_DAY_TTL = 604800;
export const THIRTY_DAYS_TTL = 2592000;
export const TWO_MONTHS_TTL = 5002000;
export const CACHE_PREFIX = process.env.CACHE_PREFIX || 'relay-agent';
export const CACHE_KEYS = {
  REFRESH_TOKEN: `${CACHE_PREFIX}:refresh-token:`, // :walletAddress
  USER_DETAIL: `${CACHE_PREFIX}:user-detailed-info:`, // :walletAddress
  REF_CODE: `${CACHE_PREFIX}:ref-code:`, // :refCode
  ALL_USERS: `${CACHE_PREFIX}:all-users`,
  ALL_REF_CODE: `${CACHE_PREFIX}:all-ref-code`,
  PREGENERATED_REF_CODE_LIST: `${CACHE_PREFIX}:all-pregenerated-ref-code`,
  PROFILE_PICTURE: `${CACHE_PREFIX}:profile-picture:`, // :walletAddress
  TITLE_GENERATION_CHECK: `${CACHE_PREFIX}:title-gen-check:`, // :sessionId
};
