import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateRSAKeyPair } from "./signature.js";
import {
  checkActorOnThisInstance,
  getActorOnThisInstance,
  setupAdminActor,
} from "../db/queries/actor.js";
import { createUser } from "../db/queries/users.js";
import { systemUserEndpoints, userEndpoints } from "../activitypub/actor.js";
import { SYSTEM_ACTOR_USERNAME } from "../activitypub/constants.js";

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

export const setupSystemUser = async () => {
  const actor = await checkActorOnThisInstance(SYSTEM_ACTOR_USERNAME);

  const { publicKey, privateKey } = generateRSAKeyPair();

  const passwordHash = await bcrypt.hash(
    crypto.randomBytes(32).toString("hex"),
    12,
  );

  await setupAdminActor(SYSTEM_ACTOR_USERNAME, publicKey);

  await createUser({
    username: SYSTEM_ACTOR_USERNAME,
    passwordHash,
    privateKey,
    actorUri: systemUserEndpoints.actorUri,
  });

  console.log("[activitypub] System user setup complete");
};
