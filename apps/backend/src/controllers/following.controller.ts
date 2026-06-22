import { FastifyRequest, FastifyReply } from "fastify";
import {
  deliverActivity,
  remoteActorLookup,
  webfingerLookup,
} from "../utils/activitypub.js";
import { createFollowingUserEntry } from "../db/queries/following.js";
import { createActivity } from "../activitypub/activities.js";
import { generateFollowActivityId } from "../utils/activityId.js";

export const handleFollowRemoteUser = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { handle } = request.body as { handle: string };

  if (!handle || !handle.includes("@")) {
    return reply.status(400).send({
      error: "Valid federated handle target required (user@domain.com).",
    });
  }

  const cleanHandle = handle.startsWith("@") ? handle.slice(1) : handle;
  const [, remoteDomain] = cleanHandle.split("@");

  try {
    const webfingerResponse = await webfingerLookup(remoteDomain, cleanHandle);

    if (!webfingerResponse.ok) {
      return reply
        .status(500)
        .send({ error: "Error fetching webfinger of user" });
    }

    const webfingerData = await webfingerResponse.json();

    const selfLink = webfingerData.links?.find((l: any) => l.rel === "self");

    if (!selfLink || !selfLink.href) {
      return reply
        .status(404)
        .send({ error: "ActivityPub profile target URI lookup failed." });
    }

    const remoteProfileUri = selfLink.href;

    console.log(remoteProfileUri);

    const remoteActor = await remoteActorLookup(remoteProfileUri);

    console.log(remoteActor);
    const remoteInbox = remoteActor.inboxUrl;

    if (!remoteInbox) {
      return reply.status(400).send({
        error: "Target profile does not contain a functional inbox URI.",
      });
    }

    const followActivityId = generateFollowActivityId();

    await createFollowingUserEntry(followActivityId, remoteProfileUri);

    const followActivity = createActivity(
      followActivityId,
      "Follow",
      remoteProfileUri,
    );

    console.log(followActivity);

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
