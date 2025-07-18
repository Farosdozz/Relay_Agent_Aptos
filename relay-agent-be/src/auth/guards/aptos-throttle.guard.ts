import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Rate limiting guard for Aptos nonce generation
 * Limits to 10 requests per minute per IP
 */
@Injectable()
export class AptosNonceThrottleGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Track by IP address for nonce requests
    return req.ip || req.connection?.remoteAddress || 'unknown';
  }
}

/**
 * Rate limiting guard for Aptos signature verification
 * Limits to 5 requests per minute per Aptos address
 */
@Injectable()
export class AptosVerifyThrottleGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Track by Aptos address for verification attempts
    const body = req.body;
    return body?.walletAddress || req.ip || 'unknown';
  }
}

/**
 * Rate limiting guard for Aptos token refresh
 * Limits to 20 requests per hour per user
 */
@Injectable()
export class AptosRefreshThrottleGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Track by wallet address from JWT token
    return req.user?.walletAddress || req.ip || 'unknown';
  }
}
