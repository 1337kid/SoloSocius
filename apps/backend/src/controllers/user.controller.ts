import { FastifyRequest, FastifyReply } from "fastify";
import {
  getLocalActorProfileData,
  updateLocalActorProfileData,
  deleteLocalActor,
} from "../db/queries/actor.js";
import { getUserCredentials } from "../db/queries/users.js";
import {
  createProfileUpdateActivity,
  createDeleteActorActivity,
} from "../activitypub/activities.js";
import { deliverActivityToFollowers } from "../utils/activitypub.js";
import bcrypt from "bcryptjs";

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

  const actor = await updateLocalActorProfileData({ displayName, summary });

  const activity = createProfileUpdateActivity({
    username: actor.username,
    displayName: actor.displayName || "",
    summary: actor.summary || "",
    publicKey: actor.publicKey,
    avatarUrl: actor.avatarUrl || "",
    bannerUrl: actor.bannerUrl || "",
  });

  await deliverActivityToFollowers(activity);

  return reply
    .status(200)
    .send({ message: "Profile data updated successfully." });
};

export const deleteAccount = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { password } = request.body as { password: string };

  if (!password) {
    return reply.status(400).send({ error: "Password is required." });
  }

  const user = await getUserCredentials();
  if (!user) {
    return reply.status(404).send({ error: "No local user found." });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return reply.status(401).send({ error: "Invalid password." });
  }

  const activity = createDeleteActorActivity();
  await deliverActivityToFollowers(activity);

  await deleteLocalActor();

  return reply
    .clearCookie("auth", { path: "/" })
    .status(200)
    .send({ message: "Account deleted successfully." });
};
