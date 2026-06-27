import { FastifyRequest, FastifyReply } from "fastify";
import { getLocalActorProfileData } from "../db/queries/actor.js";

export const getProfileData = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const actor = await getLocalActorProfileData();

  if (!actor) {
    return reply
      .status(404)
      .send({ error: "Actor account has not been initialized yet." });
  }

  return reply.status(200).send(actor);
};
