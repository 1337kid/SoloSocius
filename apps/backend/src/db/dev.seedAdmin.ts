import { config } from "dotenv";
import { db } from "./index.js";
import { users } from "./schema.js";
import { generateRSAKeyPair } from "../utils/signature.js";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";


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

  await db.insert(users).values({
    username: "test",
    displayName: "Test account",
    bio: "SoloSocius dev account",
    passwordHash: passwordHash,
    privateKey: privateKey,
    publicKey: publicKey,
  });

  console.log(`Dev account created with creds => test:${password}`);
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error("Seeding process encountered an failure:", err);
  process.exit(1);
});
