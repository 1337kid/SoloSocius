import { FastifyRequest, FastifyReply } from "fastify";
import {
  deliverActivityToFollowers,
  remoteActorLookup,
  remotePostLookup,
} from "../utils/activitypub.js";
import {
  createActivity,
  createInteractionActivity,
} from "../activitypub/activities.js";
import { generateInteractionActivityId } from "../utils/activityId.js";
import {
  addInteractionEntry,
  findInteractionByPostAndType,
  removeInteractionById,
} from "../db/queries/interactions.js";
import { userEndpoints } from "../activitypub/actor.js";
import {
  createTimelineEntry,
  removeTimelineBoostEntry,
} from "../db/queries/timeline.js";
import jobWorker, { JOB_TYPES } from "../jobs/index.js";

export const handleOutboundPostInteraction = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { action, targetPostUri } = request.body as {
    action: "like" | "boost";
    targetPostUri: string;
  };

  try {
    const targetPost = await remotePostLookup(targetPostUri);

    if (!targetPost)
      return reply.status(404).send({ error: "Target post not found" });

    const activityType = action === "like" ? "Like" : "Announce";

    const activityId = generateInteractionActivityId(action);

    const interactionActivity = createInteractionActivity(
      activityId,
      activityType,
      targetPostUri,
    );

    await addInteractionEntry({
      type: action,
      activityId,
      actorUri: userEndpoints.actorUri,
      postUri: targetPost.idUri,
    });

    if (!targetPost.isLocal) {
      const actorLookup = await remoteActorLookup(targetPost.actorUri);

      if (!actorLookup) {
        return reply
          .status(400)
          .send({ error: "Failed discovering remote actor inbox path." });
      }

      const remoteInbox = actorLookup.inboxUrl;
      jobWorker.createJob(JOB_TYPES.DELIVER_ACTIVITY, {
        inboxUrl: remoteInbox,
        activity: interactionActivity,
      });
    }

    if (action === "boost") {
      await createTimelineEntry({
        type: "boost",
        actorUri: userEndpoints.actorUri,
        postUri: targetPost.idUri,
      });

      await deliverActivityToFollowers(interactionActivity);
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

export const handleUndoPostInteraction = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { action, targetPostUri } = request.body as {
    action: "like" | "boost";
    targetPostUri: string;
  };

  try {
    const interaction = await findInteractionByPostAndType(
      targetPostUri,
      action,
    );

    if (!interaction)
      return reply
        .status(404)
        .send({ error: `You have not ${action}ed this post.` });

    const undoActivity = createActivity(
      `${interaction.activityId}/undo`,
      "Undo",
      {
        id: interaction.activityId,
        type: action === "like" ? "Like" : "Announce",
        actor: userEndpoints.actorUri,
        object: targetPostUri,
      },
    );

    const actor = interaction.post.actor;

    if (!actor.isLocal) {
      jobWorker.createJob(JOB_TYPES.DELIVER_ACTIVITY, {
        inboxUrl: actor.inboxUrl,
        activity: undoActivity,
      });
    }

    await removeInteractionById(interaction.id);

    if (action === "boost") {
      await deliverActivityToFollowers(undoActivity);

      await removeTimelineBoostEntry(targetPostUri, userEndpoints.actorUri);
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
