import { FastifyRequest, FastifyReply } from "fastify";
import { handleFollowActivity } from "./follow.js";
import { handleAcceptActivity } from "./accept.js";
import { handleUndoActivity } from "./undo.js";
import { remoteActorLookup } from "../../utils/activitypub.js";
import { handleCreateActivity } from "./create.js";

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
