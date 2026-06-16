import { FastifyRequest, FastifyReply } from "fastify";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { DOMAIN } from "../config/env.js";
import { generateActorObject } from "../activitypub/actor.js";

export const getActorProfile = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const [adminUser] = await db.select().from(users).limit(1);

  if (!adminUser) {
    return reply
      .status(404)
      .send({ error: "Actor account has not been initialized yet." });
  }

  const actorPayload = generateActorObject({
    domain: DOMAIN,
    username: adminUser.username,
    displayName: adminUser.displayName,
    bio: adminUser.bio || "",
    publicKey: adminUser.publicKey,
  });

  return reply
    .type("application/activity+json; charset=utf-8")
    .send(actorPayload);
};
