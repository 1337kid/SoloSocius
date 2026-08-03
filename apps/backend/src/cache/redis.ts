import { Redis } from "ioredis";
import { REDIS_URL } from "../config/env.js";

const redis = new Redis(REDIS_URL, {
  lazyConnect: true,
  enableOfflineQueue: false,
});

export const initializeRedis = async () => {
  await redis.connect();
  console.log("[cache] Redis connected");
  await redis.flushall().then(() => {
    console.log("[cache] Redis flushed");
  }).catch((err: Error) => {
    console.error("[cache] Failed to flush Redis on ready:", err.message);
  });
};

redis.on("error", (err: Error) => {
  console.error("[cache] Redis error:", err.message);
});

export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const val = await redis.get(key);
    return val ? (JSON.parse(val) as T) : null;
  } catch {
    return null;
  }
};

export const setCache = async (
  key: string,
  val: unknown,
  ttlSeconds: number,
): Promise<void> => {
  try {
    await redis.set(key, JSON.stringify(val), "EX", ttlSeconds);
  } catch {
    // cache failures are non-fatal
  }
};

export const deleteCache = async (...keys: string[]): Promise<void> => {
  try {
    await redis.del(...keys);
  } catch {
    // cache failures are non-fatal
  }
};
