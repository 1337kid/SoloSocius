import { FastifyRequest, FastifyReply } from "fastify";
import { deliverActivity, remoteFetch } from "../utils/activitypub.js";
import { createFollowingUserEntry } from "../db/queries/following.js";
import { createActivity } from "../activitypub/activities.js";

export const handleFollowRemoteUser = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { remoteProfileUri } = request.body as { remoteProfileUri: string };

  if (!remoteProfileUri) {
    return reply
      .status(400)
      .send({ error: "Missing target remoteProfileUri parameter." });
  }

  try {
    const profileLookup = await remoteFetch(remoteProfileUri);
    if (!profileLookup.ok) {
      return reply
        .status(400)
        .send({ error: "Could not discover target remote profile path." });
    }

    const remoteActor = (await profileLookup.json()) as any;
    const remoteInbox = remoteActor.inbox;

    if (!remoteInbox) {
      return reply.status(400).send({
        error: "Target profile does not contain a functional inbox URI.",
      });
    }

    await createFollowingUserEntry(remoteProfileUri, remoteInbox);

    const followActivity = createActivity("Follow", remoteProfileUri);

    const success = await deliverActivity({
      inboxUrl: remoteInbox,
      activity: followActivity,
    });

    if (!success) {
      return reply.status(502).send({
        error: "Delivery to remote inbox failed.",
      });
    }

    return reply.status(200).send({
      message: "Follow activity delivered",
      status: "pending",
    });
  } catch (error) {
    console.log("Error sending follow activity: ", error);
    return reply.status(500).send({ error: "Internal Server Error." });
  }
};
