import { users } from "../schema.js";
import { db } from "../index.js";

export const getUserPrivateKey = async () => {
  const result = await db
    .select({ privateKey: users.privateKey })
    .from(users)
    .limit(1);
  return result[0].privateKey;
};


