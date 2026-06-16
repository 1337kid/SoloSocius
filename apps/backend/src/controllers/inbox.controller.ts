import { FastifyRequest, FastifyReply } from "fastify";
import { db } from "../db/index.js";
import { posts, followers } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { storeRemotePost } from "../db/queries/posts.js";
import { remoteFetch } from "../utils/activitypub.js";
import {
  createFollowerEntry,
  removeFollowerEntry,
} from "../db/queries/followers.js";

export const handleIncomingInbox = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const activity = request.body as any;

  if (!activity || !activity.type) {
    return reply
      .status(400)
      .send({ error: "Invalid ActivityPub payload structure." });
  }

  const activityType = activity.type;

  try {
    switch (activityType) {
      case "Create": {
        const nestedObject = activity.object;

        if (nestedObject && nestedObject.type === "Note") {
          await storeRemotePost({
            actorUri: activity.actor,
            idUri: nestedObject.id,
            content: nestedObject.id || "",
            inReplyTo: nestedObject.inReplyTo || null,
            url: nestedObject.url || null,
            published: nestedObject.published,
          });
        }
        break;
      }

      case "Follow": {
        const actorLookup = await remoteFetch(activity.actor);

        if (actorLookup.ok) {
          const remoteActorProfile = (await actorLookup.json()) as any;

          await createFollowerEntry({
            followerActorUri: activity.actor,
            inboxUrl: remoteActorProfile.inbox,
            sharedInboxUrl:
              remoteActorProfile.endpoints?.sharedInboxUrl ||
              remoteActorProfile.inbox,
          });
        }

        break;
      }

      case "Undo": {
        const nestedObject = activity.object;

        if (nestedObject && nestedObject.type === "Follow") {
          // remote actor unfollowed
          await removeFollowerEntry(activity.actor);
        }
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
