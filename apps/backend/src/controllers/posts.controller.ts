import { FastifyRequest, FastifyReply } from "fastify";
import {
  deliverActivity,
  deliverActivityToFollowers,
  remoteFetch,
} from "../utils/activitypub.js";
import {
  createUserPost,
  deletePostFromDB,
  getPostById,
  getPostFromDB,
  getPostsByActorUris,
  updatePostContent,
  updateUserPostUri,
} from "../db/queries/posts.js";
import {
  createDeleteActivity,
  createInteractionActivity,
  createNoteActivity,
  createNotePayload,
  createNoteUpdatePayload,
} from "../activitypub/activities.js";
import { getAllAcceptedFollowingActorUri } from "../db/queries/following.js";
import { userEndpoints } from "../activitypub/actor.js";

export const createPost = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { content, inReplyTo } = request.body as {
    content: string;
    inReplyTo?: string;
  };

  if (!content || content.trim() === "") {
    return reply.status(400).send({ error: "Post content cannot be empty." });
  }

  try {
    const newPost = await createUserPost({
      content,
      inReplyTo,
    });

    const postUri = await updateUserPostUri(newPost.id);

    const activityPayload = createNoteActivity({
      idUri: postUri,
      inReplyTo: newPost.inReplyTo,
      createdAt: newPost.createdAt,
      content: newPost.content,
      id: newPost.id,
      url: postUri,
    });

    await deliverActivityToFollowers(activityPayload);

    return reply.status(201).send({ ...newPost, idUri: postUri, url: postUri });
  } catch (error) {
    console.error("Error in post creation:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
};

export const getPostActivity = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { id } = request.params as { id: string };

  try {
    const post = await getPostById(id);
    if (!post) {
      return reply.status(404).send({ error: "Post not found" });
    }

    const notePayload = createNotePayload({
      idUri: post.idUri,
      createdAt: post.createdAt,
      content: post.content,
    });

    return reply
      .type("application/activity+json; charset=utf-8")
      .send(notePayload);
  } catch (error) {
    console.log("Error fetching post: ", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
};

export const updatePost = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { id } = request.params as { id: string };
  const { content } = request.body as { content: string };

  if (!content || content.trim() === "") {
    return reply.status(400).send({ error: "Post content cannot be empty." });
  }

  try {
    const existingPost = await getPostById(id);
    if (!existingPost || !existingPost.isLocal) {
      return reply.status(404).send({ error: "Local post not found." });
    }

    const updatedPost = await updatePostContent(id, content);

    const noteUpdateActivity = createNoteUpdatePayload({
      idUri: updatedPost.idUri,
      createdAt: updatedPost.createdAt,
      content: updatedPost.content,
    });

    await deliverActivityToFollowers(noteUpdateActivity);

    return reply.status(200).send(updatedPost);
  } catch (error) {
    console.log("Error while updating post: ", error);
    return reply.status(500).send({ error: "Internal Sever Error" });
  }
};

export const deletePost = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { id } = request.params as { id: string };

  try {
    const existingPost = await getPostById(id);
    if (!existingPost || !existingPost.isLocal) {
      return reply.status(404).send({ error: "Local post not found." });
    }

    const deleteActivity = createDeleteActivity(existingPost.idUri);

    await deletePostFromDB(id);

    await deliverActivityToFollowers(deleteActivity);

    return reply.status(200).send({ message: "Post deleted successfully" });
  } catch (error) {
    console.log("Error while deleting post: ", error);
    return reply.status(500).send({ error: "Internal Sever Error" });
  }
};

export const getHomeTimeline = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const TIMELINE_LIMIT = 20;
  const { page } = request.query as { page?: string };
  const pageNumber = parseInt(page || "1", 10);

  if (isNaN(pageNumber) || pageNumber < 1) {
    return reply.status(400).send({ error: "Invalid timeline page." });
  }

  const offsetValue = (pageNumber - 1) * TIMELINE_LIMIT;

  try {
    const followedAccounts = await getAllAcceptedFollowingActorUri();

    const actorsToShow = [...followedAccounts, userEndpoints.actorUri];

    const feedItems = await getPostsByActorUris(
      actorsToShow,
      TIMELINE_LIMIT,
      offsetValue,
    );

    return reply.send({
      page: pageNumber,
      limit: TIMELINE_LIMIT,
      count: feedItems.length,
      nextPage: feedItems.length === TIMELINE_LIMIT ? pageNumber + 1 : null,
      items: feedItems,
    });
  } catch (error) {
    console.error("Failed assembling timeline:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
};

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

    const actorLookup = await remoteFetch(targetPost.actorUri);

    if (!actorLookup.ok) {
      return reply
        .status(400)
        .send({ error: "Failed discovering remote actor inbox path." });
    }

    const remoteActorProfile = (await actorLookup.json()) as any;
    const remoteInbox = remoteActorProfile.inbox;

    const activityType = action === "like" ? "Like" : "Announce";

    const interactionActivity = createInteractionActivity(
      activityType,
      targetPostUri,
    );

    const success = await deliverActivity({
      inboxUrl: remoteInbox,
      activity: interactionActivity,
    });

    if (!success) {
      return reply.status(502).send({
        error: "Remote instance rejected or timed out on interaction payload.",
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
