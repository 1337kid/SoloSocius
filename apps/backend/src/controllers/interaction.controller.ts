import { FastifyRequest, FastifyReply } from "fastify";
import {
  deliverActivity,
  deliverActivityToFollowers,
  remoteActorLookup,
} from "../utils/activitypub.js";
import { getPostFromDB } from "../db/queries/posts.js";
import { createInteractionActivity } from "../activitypub/activities.js";
import { generateInteractionActivityId } from "../utils/activityId.js";
import { addInteractionEntry } from "../db/queries/interactions.js";
import { userEndpoints } from "../activitypub/actor.js";
import { createTimelineEntry } from "../db/queries/timeline.js";

export const handleOutboundPostInteraction = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { action, targetPostUri } = request.body as {
    action: "like" | "boost";
    targetPostUri: string;
  };

  if (!targetPostUri || !["like", "boost"].includes(action)) {
    return reply.status(400).send({
      error: "Valid action (like/boost) and targetPostUri are required.",
    });
  }

  try {
    const targetPost = await getPostFromDB(targetPostUri);

    if (!targetPost)
      return reply.status(404).send({ error: "Target post not found" });

    const actorLookup = await remoteActorLookup(targetPost.actorUri);

    if (!actorLookup) {
      return reply
        .status(400)
        .send({ error: "Failed discovering remote actor inbox path." });
    }

    const remoteInbox = actorLookup.inboxUrl;

    const activityType = action === "like" ? "Like" : "Announce";

    const activityId = generateInteractionActivityId(action);

    const interactionActivity = createInteractionActivity(
      activityId,
      activityType,
      targetPostUri,
    );

    await deliverActivity({
      inboxUrl: remoteInbox,
      activity: interactionActivity,
    });

    await addInteractionEntry({
      type: action,
      activityId,
      actorUri: userEndpoints.actorUri,
      postUri: targetPost.idUri,
    });

    if (action === "boost") {
      await deliverActivityToFollowers(interactionActivity);
      
      await createTimelineEntry({
        type: "boost",
        actorUri: userEndpoints.actorUri,
        postUri: targetPost.idUri,
      });
    }

    return reply.status(200).send({
      message: `Sent ${action} Activity`,
      status: "success",
    });
  } catch (error) {
    console.log("Error in sending post interaction: ", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
};
