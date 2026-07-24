import { AppError, ForbiddenError } from "@/lib/utils/error-handler";

export class RateLimitError extends AppError {
  constructor(message = "Too many requests. Please try again shortly.", retryAfterSec = 60) {
    super("RATE_LIMITED", message, 429, { retryAfterSec });
    this.name = "RateLimitError";
  }
}

type Bucket = { count: number; resetAt: number };

const memoryBuckets = new Map<string, Bucket>();

/**
 * Sliding-window style rate limit with in-memory fallback.
 * Uses Redis when REDIS_URL is configured; otherwise process-local buckets
 * (fine for single-node / local dev).
 */
export async function enforceRateLimit(options: {
  key: string;
  limit: number;
  windowSec: number;
}): Promise<void> {
  const { key, limit, windowSec } = options;
  const now = Date.now();
  const redisUrl = process.env.REDIS_URL?.trim();

  if (redisUrl) {
    try {
      const { ensureRedisConnected } = await import("@/lib/database/redis");
      const redis = await ensureRedisConnected();
      const redisKey = `rl:${key}`;
      const count = await redis.incr(redisKey);
      if (count === 1) {
        await redis.expire(redisKey, windowSec);
      }
      if (count > limit) {
        const ttl = await redis.ttl(redisKey);
        throw new RateLimitError(undefined, ttl > 0 ? ttl : windowSec);
      }
      return;
    } catch (error) {
      if (error instanceof RateLimitError) throw error;
      // Fall through to memory if Redis is misconfigured mid-request
    }
  }

  const bucket = memoryBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return;
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    throw new RateLimitError(undefined, Math.ceil((bucket.resetAt - now) / 1000));
  }
}

/** Assert the authenticated user owns or may act for a resource user id. */
export function assertSameUser(sessionUserId: string, resourceUserId: string, message?: string) {
  if (sessionUserId !== resourceUserId) {
    throw new ForbiddenError(message || "You do not have access to this resource");
  }
}
