import { FastifyRequest, FastifyReply } from "fastify";
import {
  approveFollowRequest,
  getFollowerById,
  getFollowersByOffset,
  getFollowersDetailsByOffset,
  getFollowRequestsByOffset,
  getUserFollowersCount,
  removeFollowerEntry,
} from "../db/queries/followers.js";
import {
  createOrderedCollection,
  createOrderedCollectionPage,
} from "../activitypub/collections.js";
import { userEndpoints } from "../activitypub/actor.js";
import {
  createAcceptFollowActivity,
  createRejectFollowActivity,
} from "../activitypub/activities.js";
import jobWorker, { JOB_TYPES } from "../jobs/index.js";
import type { IdParams } from "../validations/common.val.js";
import type {
  DefaultPageQuery,
  OptionalPageQuery,
} from "../validations/pagination.val.js";

const PAGE_SIZE = 20;

export const handleFollowersCollectionRequest = async (
  request: FastifyRequest<{ Querystring: OptionalPageQuery }>,
  reply: FastifyReply,
) => {
  const { page } = request.query;

  try {
    const totalItems = await getUserFollowersCount();

    // return metadata if no page query
    if (page === undefined) {
      const collectionWrapper = createOrderedCollection(
        userEndpoints.followers,
        {
          totalItems,
          first: "1",
          last: `${Math.max(1, Math.ceil(totalItems / PAGE_SIZE))}`,
        },
      );

      return reply
        .type("application/activity+json; charset=utf-8")
        .send(collectionWrapper);
    }

    const offsetValue = (page - 1) * PAGE_SIZE;

    const followersEntries = await getFollowersByOffset(offsetValue, PAGE_SIZE);

    const hasMoreItems = totalItems > page * PAGE_SIZE;

    const collectionPage = createOrderedCollectionPage(
      userEndpoints.followers,
      page,
      totalItems,
      followersEntries,
      hasMoreItems,
    );

    return reply
      .type("application/activity+json; charset=utf-8")
      .send(collectionPage);
  } catch (error) {
    console.error("Failed compiling paginated outbox stream:", error);
    return reply.status(500).send({ error: "Internal Server Error." });
  }
};

export const handleGetAllFollowers = async (
  request: FastifyRequest<{ Querystring: DefaultPageQuery }>,
  reply: FastifyReply,
) => {
  const { page } = request.query;

  try {
    const offsetValue = (page - 1) * PAGE_SIZE;

    const followersDetails = await getFollowersDetailsByOffset(
      offsetValue,
      PAGE_SIZE,
    );

    return reply
      .type("application/activity+json; charset=utf-8")
      .send(followersDetails);
  } catch (error) {
    console.error("Failed getting all followers:", error);
    return reply.status(500).send({ error: "Internal Server Error." });
  }
};

export const getAllFollowRequests = async (
  request: FastifyRequest<{ Querystring: DefaultPageQuery }>,
  reply: FastifyReply,
) => {
  const { page } = request.query;

  try {
    const offsetValue = (page - 1) * PAGE_SIZE;

    const followRequests = await getFollowRequestsByOffset(
      offsetValue,
      PAGE_SIZE,
    );

    return reply
      .type("application/activity+json; charset=utf-8")
      .send(followRequests);
  } catch (error) {
    console.error("Failed getting all follow requests:", error);
    return reply.status(500).send({ error: "Internal Server Error." });
  }
};

export const handleApproveFollowRequest = async (
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) => {
  const { id } = request.params;

  try {
    const followRequest = await approveFollowRequest(id);

    if (!followRequest) {
      return reply.status(404).send({ error: "Follow request not found" });
    }

    const acceptActivity = createAcceptFollowActivity(
      followRequest?.incomingFollowActivityId,
      followRequest.actor.actorUri,
    );

    jobWorker.createJob(JOB_TYPES.DELIVER_ACTIVITY, {
      inboxUrl: followRequest.actor.inboxUrl,
      activity: acceptActivity,
    });

    return reply
      .status(200)
      .send({ message: "Follow request approved successfully." });
  } catch (error) {
    console.error("Failed approving follow request:", error);
    return reply.status(500).send({ error: "Internal Server Error." });
  }
};

export const handleRejectFollow = async (
  request: FastifyRequest<{ Params: IdParams }>,
  reply: FastifyReply,
) => {
  const { id } = request.params;

  try {
    const follower = await getFollowerById(id);

    if (!follower) {
      return reply.status(404).send({ error: "Follower not found" });
    }

    await removeFollowerEntry(follower.actor.actorUri);

    const rejectActivity = createRejectFollowActivity(
      follower.incomingFollowActivityId,
      follower.actor.actorUri,
    );

    console.log("rejectActivity", rejectActivity);

    jobWorker.createJob(JOB_TYPES.DELIVER_ACTIVITY, {
      inboxUrl: follower.actor.inboxUrl,
      activity: rejectActivity,
    });

    return reply.status(200).send({ message: "Follow rejected successfully." });
  } catch (error) {
    console.error("Failed rejecting follow request:", error);
    return reply.status(500).send({ error: "Internal Server Error." });
  }
};
