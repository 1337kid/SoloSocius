import bcrypt from "bcryptjs";
import { generateRSAKeyPair } from "./signature.js";
import { setupAdminActor } from "../db/queries/actor.js";
import { createUser } from "../db/queries/users.js";
import { userEndpoints } from "../activitypub/actor.js";

export const setupAdminUser = async (username: string, password: string) => {
  const { publicKey, privateKey } = generateRSAKeyPair();

  const passwordHash = await bcrypt.hash(password, 12);

  await setupAdminActor(username, publicKey);

  await createUser({
    username,
    passwordHash,
    privateKey,
    actorUri: userEndpoints.actorUri,
  });
};
