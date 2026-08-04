import { FastifyRequest, FastifyReply } from "fastify";
import {
  getLocalActorProfileData,
  updateLocalActorProfileData,
  deleteLocalActor,
} from "../db/queries/actor.js";
import { getUserCredentials } from "../db/queries/users.js";
import {
  broadcastProfileUpdate,
  createDeleteActorActivity,
} from "../activitypub/activities.js";
import { deliverActivity } from "../utils/activitypub.js";
import { getAllFollowersInbox } from "../db/queries/followers.js";
import bcrypt from "bcryptjs";
import { getAllFollowingInbox } from "../db/queries/following.js";

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

  await broadcastProfileUpdate(actor);

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

  // Respond immediately so the client can log out without waiting for
  // the slow ActivityPub fan-out and DB deletion to finish.
  reply.clearCookie("auth", { path: "/" }).status(202).send({
    message: "Account deletion scheduled. You have been logged out.",
  });

  (async () => {
    try {
      console.log("Delivering Delete activity to followers...");
      const followers = await getAllFollowersInbox();
      const following = await getAllFollowingInbox();
      const uniqueInboxes = new Set([
        ...followers.map((f) => f.actor.sharedInboxUrl || f.actor.inboxUrl),
        ...following.map((f) => f.actor.sharedInboxUrl || f.actor.inboxUrl),
      ]);
      await Promise.allSettled(
        Array.from(uniqueInboxes).map((inboxUrl) =>
          deliverActivity({ inboxUrl, activity }),
        ),
      );
      console.log("Deleting local actor...");
      await deleteLocalActor();
      console.log("Account deletion complete.");
    } catch (err) {
      console.error("Background account deletion failed:", err);
    }
  })();
};
