import { FastifyRequest, FastifyReply } from "fastify";
import { handleFollowActivity } from "./follow.js";
import { handleAcceptActivity } from "./accept.js";
import { handleUndoActivity } from "./undo.js";
import { remoteActorLookup } from "../../utils/activitypub.js";
import { handleCreateActivity } from "./create.js";
import { handleLikeActivity } from "./like.js";
import { handleDeleteActivity } from "./delete.js";
import { handleAnnounceActivity } from "./announce.js";
import { handleUpdateActivity } from "./update.js";
import { handleRejectActivity } from "./reject.js";

export const handleIncomingInbox = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const activity = request.body as any;

  if (
    !activity ||
    typeof activity.actor !== "string" ||
    typeof activity.type !== "string"
  ) {
    return reply
      .status(400)
      .send({ error: "Invalid ActivityPub payload structure." });
  }

  const remoteActor = await remoteActorLookup(activity.actor);

  if (!remoteActor) return reply.status(202).send();

  const activityType = activity.type;

  try {
    switch (activityType) {
      case "Create": {
        await handleCreateActivity(activity);
        break;
      }

      case "Follow": {
        await handleFollowActivity(activity);
        break;
      }

      case "Accept": {
        await handleAcceptActivity(activity);
        break;
      }

      case "Undo": {
        await handleUndoActivity(activity);
        break;
      }

      case "Like": {
        await handleLikeActivity(activity);
        break;
      }

      case "Delete": {
        await handleDeleteActivity(activity);
        break;
      }

      case "Announce": {
        await handleAnnounceActivity(activity);
        break;
      }

      case "Update": {
        await handleUpdateActivity(activity);
        break;
      }

      case "Reject": {
        await handleRejectActivity(activity);
        break;
      }

      default:
        console.log(
          `Unhandled activity type [${activityType}]. Acknowledging with 202.`,
        );
        break;
    }

    return reply.status(202).send({ status: "ok" });
  } catch (error) {
    console.log(`Error processing incoming activity: ${error}`);
    return reply.status(500).send({ error: "Internal Server Error." });
  }
};
