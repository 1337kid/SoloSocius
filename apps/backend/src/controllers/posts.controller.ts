import { FastifyRequest, FastifyReply } from "fastify";
import { deliverActivityToFollowers } from "../utils/activitypub.js";
import {
  createUserPost,
  deletePostById,
  getPostById,
  getPostWithRepliesByPostId,
  updatePostContent,
  updateUserPostUri,
} from "../db/queries/posts.js";
import {
  createDeleteActivity,
  createNoteActivity,
  createNotePayload,
  createNoteUpdatePayload,
} from "../activitypub/activities.js";
import { userEndpoints } from "../activitypub/actor.js";
import { createTimelineEntry } from "../db/queries/timeline.js";
import type { MediaItem } from "../db/schema.js";

export const createPost = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { content, inReplyTo, mediaItems } = request.body as {
    content: string;
    inReplyTo?: string;
    mediaItems?: MediaItem[];
  };

  if (!content || content.trim() === "") {
    return reply.status(400).send({ error: "Post content cannot be empty." });
  }

  try {
    const newPost = await createUserPost({
      content,
      inReplyTo,
      attachments: mediaItems,
    });

    const postUri = await updateUserPostUri(newPost.id);

    const activityPayload = createNoteActivity({
      idUri: postUri,
      inReplyTo: newPost.inReplyTo,
      createdAt: newPost.createdAt,
      content: newPost.content,
      id: newPost.id,
      url: postUri,
      attachments: newPost.mediaItems,
    });

    await createTimelineEntry({
      actorUri: userEndpoints.actorUri,
      postUri: postUri,
      type: "post",
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
      url: post.url || post.idUri,
      attachments: post.mediaItems || [],
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
      updatedAt: new Date(),
      attachments: updatedPost.mediaItems || [],
    });

    console.log("noteUpdateActivity: ", noteUpdateActivity);

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

    await deletePostById(id);

    await deliverActivityToFollowers(deleteActivity);

    return reply.status(200).send({ message: "Post deleted successfully" });
  } catch (error) {
    console.log("Error while deleting post: ", error);
    return reply.status(500).send({ error: "Internal Sever Error" });
  }
};

export const getPostWithReplies = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { id } = request.params as { id: string };

  try {
    const post = await getPostWithRepliesByPostId(id);
    if (!post) {
      return reply.status(404).send({ error: "Post not found" });
    }

    return reply.status(200).send(post);
  } catch (error) {
    console.log("Error while getting post with replies: ", error);
    return reply.status(500).send({ error: "Internal Sever Error" });
  }
};
