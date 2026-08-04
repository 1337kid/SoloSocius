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

// Atomically bumps a cached counter, but only if it is already warm.
const ADJUST_COUNT_SCRIPT = `
  if redis.call("EXISTS", KEYS[1]) == 1 then
    redis.call("INCRBY", KEYS[1], ARGV[1])
  end
`;

export const adjustCachedCount = async (
  key: string,
  delta: number,
): Promise<void> => {
  try {
    await redis.eval(ADJUST_COUNT_SCRIPT, 1, key, delta);
  } catch {
    // cache failures are non-fatal
  }
};

// Atomically adds/removes a member from a JSON-array cache entry
const ADD_TO_LIST_SCRIPT = `
  local raw = redis.call("GET", KEYS[1])
  if raw then
    local list = cjson.decode(raw)
    for _, v in ipairs(list) do
      if v == ARGV[1] then return end
    end
    table.insert(list, ARGV[1])
    redis.call("SET", KEYS[1], cjson.encode(list), "KEEPTTL")
  end
`;

const REMOVE_FROM_LIST_SCRIPT = `
  local raw = redis.call("GET", KEYS[1])
  if raw then
    local list = cjson.decode(raw)
    local filtered = {}
    for _, v in ipairs(list) do
      if v ~= ARGV[1] then table.insert(filtered, v) end
    end
    redis.call("SET", KEYS[1], cjson.encode(filtered), "KEEPTTL")
  end
`;

export const addToCachedList = async (
  key: string,
  member: string,
): Promise<void> => {
  try {
    await redis.eval(ADD_TO_LIST_SCRIPT, 1, key, member);
  } catch {
    // cache failures are non-fatal
  }
};

export const removeFromCachedList = async (
  key: string,
  member: string,
): Promise<void> => {
  try {
    await redis.eval(REMOVE_FROM_LIST_SCRIPT, 1, key, member);
  } catch {
    // cache failures are non-fatal
  }
};
