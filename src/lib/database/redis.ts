import Redis from "ioredis";

import { AppError } from "@/lib/utils/error-handler";
import { logger } from "@/lib/utils/logger";

const globalForRedis = globalThis as typeof globalThis & {
  redis?: Redis;
};

function createRedisClient(): Redis {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new AppError("REDIS_CONFIG_ERROR", "REDIS_URL is required to initialize Redis", 500);
  }

  const client = new Redis(url, {
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
  });

  client.on("error", (error) => {
    logger.error({ err: error }, "Redis connection error");
  });

  return client;
}

export function getRedis(): Redis {
  if (!globalForRedis.redis) {
    globalForRedis.redis = createRedisClient();
  }
  return globalForRedis.redis;
}

export async function ensureRedisConnected(): Promise<Redis> {
  const client = getRedis();
  if (client.status === "wait" || client.status === "end") {
    await client.connect();
  }
  return client;
}

export async function getJson<T>(key: string): Promise<T | null> {
  const client = await ensureRedisConnected();
  const value = await client.get(key);
  if (!value) return null;
  return JSON.parse(value) as T;
}

export async function setJson(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
  const client = await ensureRedisConnected();
  const payload = JSON.stringify(value);
  if (ttlSeconds && ttlSeconds > 0) {
    await client.set(key, payload, "EX", ttlSeconds);
    return;
  }
  await client.set(key, payload);
}

export async function delKey(key: string): Promise<number> {
  const client = await ensureRedisConnected();
  return client.del(key);
}

export async function keyExists(key: string): Promise<boolean> {
  const client = await ensureRedisConnected();
  const result = await client.exists(key);
  return result === 1;
}

export async function disconnectRedis(): Promise<void> {
  if (globalForRedis.redis) {
    await globalForRedis.redis.quit();
    globalForRedis.redis = undefined;
    logger.info("Redis disconnected");
  }
}
