import { db } from "./index.js";
import { users, actors } from "./schema.js";
import { generateRSAKeyPair } from "../utils/signature.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { userEndpoints } from "../activitypub/actor.js";
import { DOMAIN } from "../config/env.js";

const seedAdmin = async () => {
  console.log("Checking if a user exists...");
  const existingUser = await db.select().from(users).limit(1);

  if (existingUser.length > 0) {
    console.log("User already exists. Skipping initialization.");
    process.exit(0);
  }

  console.log("Generating RSA keypair for the user...");
  const { publicKey, privateKey } = generateRSAKeyPair();

  const password = crypto.randomBytes(10).toString("base64");
  const passwordHash = await bcrypt.hash(password, 20);

  const [actor] = await db
    .insert(actors)
    .values({
      actorUri: userEndpoints.actorUri,
      username: "test",
      domain: DOMAIN,
      displayName: "Test Account",
      summary: "SoloSocius dev account",
      avatarUrl: "",
      publicKey: publicKey,
      inboxUrl: userEndpoints.inbox,
      sharedInboxUrl: userEndpoints.inbox,
      isLocal: true,
      lastFetchedAt: new Date(),
    })
    .returning();

  await db.insert(users).values({
    username: "test",
    passwordHash: passwordHash,
    privateKey: privateKey,
    actorUri: actor.actorUri,
  });

  console.log(`Dev account created with creds => test:${password}`);
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error("Seeding process encountered an failure:", err);
  process.exit(1);
});
