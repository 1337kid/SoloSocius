import { FastifyRequest, FastifyReply } from "fastify";
import { generateActorObject } from "../activitypub/actor.js";
import { getActorOnThisInstance } from "../db/queries/actor.js";
import { generateSystemActorObject } from "../activitypub/actor.js";

export const getActorProfile = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const requestContentType = request.headers["accept"] as string;
  if (requestContentType === "text/html") {
    return reply.redirect("/");
  }

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
    manuallyApprovesFollowers: actor.manuallyApprovesFollowers,
  });

  return reply
    .type("application/activity+json; charset=utf-8")
    .send(actorPayload);
};

export const getSystemActorProfile = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const requestContentType = request.headers["accept"] as string;
  if (requestContentType === "text/html") {
    return reply.redirect("/");
  }

  const actor = await getActorOnThisInstance("system");

  if (!actor) {
    return reply
      .status(404)
      .send({ error: "System actor account has not been initialized yet." });
  }

  const actorPayload = generateSystemActorObject(actor.publicKey);

  return reply
    .type("application/activity+json; charset=utf-8")
    .send(actorPayload);
};

export const getSystemActorOutbox = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const requestContentType = request.headers["accept"] as string;
  if (requestContentType === "text/html") {
    return reply.redirect("/");
  }
};
