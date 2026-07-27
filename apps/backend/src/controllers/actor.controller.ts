import { FastifyRequest, FastifyReply } from "fastify";
import { generateActorObject } from "../activitypub/actor.js";
import { getActorOnThisInstance } from "../db/queries/actor.js";

export const getActorProfile = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const actor = await getActorOnThisInstance();

  if (!actor) {
    return reply
      .status(404)
      .send({ error: "Actor account has not been initialized yet." });
  }

  const actorPayload = generateActorObject({
    username: actor.username,
    displayName: actor.displayName || "",
    summary: actor.summary || "",
    publicKey: actor.publicKey,
    avatarUrl: actor.avatarUrl || "",
    bannerUrl: actor.bannerUrl || "",
  });

  return reply
    .type("application/activity+json; charset=utf-8")
    .send(actorPayload);
};
