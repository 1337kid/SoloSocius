import { FastifyRequest, FastifyReply } from "fastify";
import {
  deliverActivity,
  remoteActorLookup,
  webfingerLookup,
} from "../utils/activitypub.js";
import {
  checkIfLocalActorIsFollowing,
  createFollowingUserEntry,
  getAcceptedFollowingByOffset,
  getFollowingDetailsByOffset,
  getUserFollowingCount,
  removeFollowingEntry,
} from "../db/queries/following.js";
import { createActivity } from "../activitypub/activities.js";
import { generateFollowActivityId } from "../utils/activityId.js";
import {
  createOrderedCollection,
  createOrderedCollectionPage,
} from "../activitypub/collections.js";
import { userEndpoints } from "../activitypub/actor.js";

export const handleFollowRemoteUser = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { actorUri } = request.body as { actorUri: string };
  
  try {
    const remoteActor = await remoteActorLookup(actorUri);

    if (!remoteActor) {
      return reply.status(404).send({ error: "User not found." });
    }

    const remoteInbox = remoteActor.inboxUrl;

    if (!remoteInbox) {
      return reply.status(400).send({
        error: "Target profile does not contain a functional inbox URI.",
      });
    }

    const followActivityId = generateFollowActivityId();

    await createFollowingUserEntry(followActivityId, remoteActor.actorUri);

    const followActivity = createActivity(
      followActivityId,
      "Follow",
      remoteActor.actorUri,
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

export const handleUnfollowRemoteUser = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { actorUri } = request.body as { actorUri: string };

  try {
    const following = await checkIfLocalActorIsFollowing(actorUri);

    if (!following) {
      return reply
        .status(404)
        .send({ error: "You are not following this user." });
    }

    await removeFollowingEntry(actorUri);

    const unfollowActivity = createActivity(
      `${following.followActivityId}#undo`,
      "Undo",
      following.followActivityId,
    );

    await deliverActivity({
      inboxUrl: following.actor.inboxUrl,
      activity: unfollowActivity,
    });

    return reply.status(200).send({
      message: "Unfollow successful",
    });
  } catch (error) {
    console.log("Error sending unfollow activity: ", error);
    return reply.status(500).send({ error: "Internal Server Error." });
  }
};

const PAGE_SIZE = 20;

export const handleFollowingCollectionRequest = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { page } = request.query as { page?: string };

  try {
    const totalItems = await getUserFollowingCount();

    // return metadata if no page query
    if (!page) {
      const collectionWrapper = createOrderedCollection(
        userEndpoints.following,
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

    const followingEntries = await getAcceptedFollowingByOffset(
      offsetValue,
      PAGE_SIZE,
    );

    const hasMoreItems = totalItems > pageNumber * PAGE_SIZE;

    const collectionPage = createOrderedCollectionPage(
      userEndpoints.following,
      pageNumber,
      totalItems,
      followingEntries,
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

export const handleGetAllFollowing = async (
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

    const followingDetails = await getFollowingDetailsByOffset(
      offsetValue,
      PAGE_SIZE,
    );

    return reply
      .type("application/activity+json; charset=utf-8")
      .send(followingDetails);
  } catch (error) {
    console.error("Failed getting all following:", error);
    return reply.status(500).send({ error: "Internal Server Error." });
  }
};

export const handleSearchRemoteUser = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const remoteActor = (request as any).remoteActor;

  if (!remoteActor) {
    return reply.status(404).send({ error: "User not found." });
  }

  const isFollowing = await checkIfLocalActorIsFollowing(remoteActor.actorUri);

  return reply.status(200).send({
    actorUri: remoteActor.actorUri,
    displayName: remoteActor.displayName,
    username: remoteActor.username,
    domain: remoteActor.domain,
    avatarUrl: remoteActor.avatarUrl,
    isFollowing: !!isFollowing,
  });
};
