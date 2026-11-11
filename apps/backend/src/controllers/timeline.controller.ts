import { FastifyReply, FastifyRequest } from "fastify";
import { userEndpoints } from "../activitypub/actor.js";
import { getProfileTimeline } from "../db/queries/timeline.js";
import { getAllAcceptedFollowingActorUri } from "../db/queries/following.js";
import type { DefaultPageQuery } from "../validations/pagination.val.js";

const TIMELINE_LIMIT = 20;

const serializeTimelineItems = (
  feedItems: Awaited<ReturnType<typeof getProfileTimeline>>,
) => {
  return feedItems.map((item) => {
    return {
      event: item.event,
      actor: item.actor,
      post: {
        ...item.post,
        actor: item.postActor,
        inReplyTo: item.parentPost
          ? { ...item.parentPost, actor: item.parentActor }
          : null,
      },
    };
  });
};

const buildTimelinePage = (
  pageNumber: number,
  feedItems: Awaited<ReturnType<typeof getProfileTimeline>>,
) => ({
  page: pageNumber,
  limit: TIMELINE_LIMIT,
  count: feedItems.length,
  nextPage: feedItems.length === TIMELINE_LIMIT ? pageNumber + 1 : null,
  items: serializeTimelineItems(feedItems),
});

const pageWindow = (page: number) => ({
  pageNumber: page,
  offsetValue: (page - 1) * TIMELINE_LIMIT,
});

export const getHomeFeed = async (
  request: FastifyRequest<{ Querystring: DefaultPageQuery }>,
  reply: FastifyReply,
) => {
  try {
    const followedAccounts = await getAllAcceptedFollowingActorUri();

    const actorsToShow = [...followedAccounts, userEndpoints.actorUri];
    const { pageNumber, offsetValue } = pageWindow(request.query.page);

    const feedItems = await getProfileTimeline(
      actorsToShow,
      TIMELINE_LIMIT,
      offsetValue,
    );

    return reply.send(buildTimelinePage(pageNumber, feedItems));
  } catch (error) {
    console.error("Failed assembling feed:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
};

export const getFederatedTimeline = async (
  request: FastifyRequest<{ Querystring: DefaultPageQuery }>,
  reply: FastifyReply,
) => {
  try {
    const { pageNumber, offsetValue } = pageWindow(request.query.page);
    const feedItems = await getProfileTimeline(
      null,
      TIMELINE_LIMIT,
      offsetValue,
    );

    return reply.send(buildTimelinePage(pageNumber, feedItems));
  } catch (error) {
    console.error("Failed assembling federated timeline:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
};

export const getPublicTimeline = async (
  request: FastifyRequest<{ Querystring: DefaultPageQuery }>,
  reply: FastifyReply,
) => {
  try {
    const { pageNumber, offsetValue } = pageWindow(request.query.page);
    const feedItems = await getProfileTimeline(
      [userEndpoints.actorUri],
      TIMELINE_LIMIT,
      offsetValue,
    );

    return reply.send(buildTimelinePage(pageNumber, feedItems));
  } catch (error) {
    console.error("Failed assembling public timeline:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
};
