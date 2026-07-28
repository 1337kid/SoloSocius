import { users } from "../schema.js";
import { db } from "../index.js";
import { getCache, setCache } from "../../cache/redis.js";
import { CacheKeys, TTL } from "../../cache/keys.js";

interface UserType {
  username: string;
  passwordHash: string;
  privateKey: string;
  actorUri: string;
}

export const getUserPrivateKey = async () => {
  const cached = await getCache<string>(CacheKeys.privateKey);
  if (cached) return cached;

  const result = await db
    .select({ privateKey: users.privateKey })
    .from(users)
    .limit(1);
  const privateKey = result[0].privateKey;
  await setCache(CacheKeys.privateKey, privateKey, TTL.privateKey);
  return privateKey;
};

export const getUserCredentials = async () => {
  return db.query.users.findFirst({
    columns: {
      username: true,
      passwordHash: true,
    },
  });
};

export const createUser = async (data: UserType) => {
  await db.insert(users).values(data);
};