import { users } from "../schema.js";
import { db } from "../index.js";
import { SYSTEM_ACTOR_USERNAME } from "../../activitypub/constants.js";
import { eq, not } from "drizzle-orm";

interface UserType {
  username: string;
  passwordHash: string;
  privateKey: string;
  actorUri: string;
}

export const getUserPrivateKey = async () => {
  const result = await db
    .select({ privateKey: users.privateKey })
    .from(users)
    .where(not(eq(users.username, SYSTEM_ACTOR_USERNAME)))
    .limit(1);

  const privateKey = result[0].privateKey;
  return privateKey;
};

export const getSystemUserPrivateKey = async () => {
  const result = await db
    .select({ privateKey: users.privateKey })
    .from(users)
    .where(eq(users.username, SYSTEM_ACTOR_USERNAME));

  const privateKey = result[0].privateKey;
  return privateKey;
};

export const getUserCredentials = async () => {
  return db.query.users.findFirst({
    columns: {
      username: true,
      passwordHash: true,
    },
    where: not(eq(users.username, SYSTEM_ACTOR_USERNAME)),
  });
};

export const createUser = async (data: UserType) => {
  await db.insert(users).values(data);
};
