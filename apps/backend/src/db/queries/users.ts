import { users } from "../schema.js";
import { db } from "../index.js";

export const getUser = async () => {
  const result = await db.select().from(users);
  return result[0];
};

export const getUserPrivateKey = async () => {
  const result = await db
    .select({ privateKey: users.privateKey })
    .from(users)
    .limit(1);
  return result[0].privateKey;
};
