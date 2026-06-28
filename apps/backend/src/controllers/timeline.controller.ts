import { FastifyReply } from "fastify";
import { userEndpoints } from "../activitypub/actor.js";
import { getFeedEvents, getProfileTimeline } from "../db/queries/timeline.js";
import { getAllAcceptedFollowingActorUri } from "../db/queries/following.js";

const TIMELINE_LIMIT = 20;

export const getHomeFeed = async (request: any, reply: FastifyReply) => {
  try {
    const followedAccounts = await getAllAcceptedFollowingActorUri();

    const actorsToShow = [...followedAccounts, userEndpoints.actorUri];

    const feedItems = await getFeedEvents(
      actorsToShow,
      TIMELINE_LIMIT,
      request.offsetValue,
    );

    return reply.send({
      page: request.pageNumber,
      limit: TIMELINE_LIMIT,
      count: feedItems.length,
      nextPage:
        feedItems.length === TIMELINE_LIMIT ? request.pageNumber + 1 : null,
      items: feedItems,
    });
  } catch (error) {
    console.error("Failed assembling feed:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
};

export const getPublicTimeline = async (request: any, reply: FastifyReply) => {
  try {
    const feedItems = await getProfileTimeline(
      TIMELINE_LIMIT,
      request.offsetValue,
    );

    const serializedItems = feedItems.map((item) => {
      return {
        event: item.event,
        actor: item.actor,
        post: {
          ...item.post,
          actor: item.postActor,
          inReplyTo: item.parentPost ? { ...item.parentPost, actor: item.parentActor } : null,
        },
      };
    });

    return reply.send({
      page: request.pageNumber,
      limit: TIMELINE_LIMIT,
      count: feedItems.length,
      nextPage:
        feedItems.length === TIMELINE_LIMIT ? request.pageNumber + 1 : null,
      items: serializedItems,
    });
  } catch (error) {
    console.error("Failed assembling public timeline:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
};
