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
import { deliverActivity } from "../utils/activitypub.js";
import {
  createAcceptFollowActivity,
  createRejectFollowActivity,
} from "../activitypub/activities.js";

const PAGE_SIZE = 20;

export const handleFollowersCollectionRequest = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { page } = request.query as { page?: string };

  try {
    const totalItems = await getUserFollowersCount();

    // return metadata if no page query
    if (!page) {
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

    const pageNumber = parseInt(page, 10);
    if (isNaN(pageNumber) || pageNumber < 1) {
      return reply
        .status(400)
        .send({ error: "Invalid outbox page identifier specification." });
    }

    const offsetValue = (pageNumber - 1) * PAGE_SIZE;

    const followersEntries = await getFollowersByOffset(offsetValue, PAGE_SIZE);

    const hasMoreItems = totalItems > pageNumber * PAGE_SIZE;

    const collectionPage = createOrderedCollectionPage(
      userEndpoints.followers,
      pageNumber,
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
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { page } = request.query as { page?: string };

  try {
    const pageNumber = parseInt(page ?? "1", 10);
    if (isNaN(pageNumber) || pageNumber < 1) {
      return reply
        .status(400)
        .send({ error: "Invalid outbox page identifier specification." });
    }

    const offsetValue = (pageNumber - 1) * PAGE_SIZE;

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
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { page } = request.query as { page?: string };

  try {
    const pageNumber = parseInt(page ?? "1", 10);
    if (isNaN(pageNumber) || pageNumber < 1) {
      return reply
        .status(400)
        .send({ error: "Invalid outbox page identifier specification." });
    }

    const offsetValue = (pageNumber - 1) * PAGE_SIZE;

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
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { id } = request.params as { id: string };

  try {
    const followRequest = await approveFollowRequest(id);

    if (!followRequest) {
      return reply.status(404).send({ error: "Follow request not found" });
    }

    const acceptActivity = createAcceptFollowActivity(
      followRequest?.incomingFollowActivityId,
      followRequest.actor.actorUri,
    );

    console.log("acceptActivity", acceptActivity);

    await deliverActivity({
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
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { id } = request.params as { id: string };

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

    await deliverActivity({
      inboxUrl: follower.actor.inboxUrl,
      activity: rejectActivity,
    });

    return reply.status(200).send({ message: "Follow rejected successfully." });
  } catch (error) {
    console.error("Failed rejecting follow request:", error);
    return reply.status(500).send({ error: "Internal Server Error." });
  }
};
