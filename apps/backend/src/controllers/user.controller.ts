import { FastifyRequest, FastifyReply } from "fastify";
import {
  getLocalActorProfileData,
  updateLocalActorProfileData,
} from "../db/queries/actor.js";

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

export const updateProfileData = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { displayName, summary } = request.body as {
    displayName: string;
    summary: string;
  };

  await updateLocalActorProfileData({ displayName, summary });

  return reply
    .status(200)
    .send({ message: "Profile data updated successfully." });
};
