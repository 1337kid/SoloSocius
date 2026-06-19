import { FastifyRequest, FastifyReply } from "fastify";
import { deliverActivity } from "../utils/activitypub.js";
import {
  createUserPost,
  getPostById,
  updateUserPostUri,
} from "../db/queries/posts.js";
import {
  createNoteActivity,
  createNotePayload,
} from "../activitypub/activities.js";
import { getAllFollowers } from "../db/queries/followers.js";

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

    const userFollowers = await getAllFollowers();

    if (userFollowers.length > 0) {
      const uniqueDeliveryInboxes = new Set<string>();
      for (const follower of userFollowers) {
        uniqueDeliveryInboxes.add(follower.sharedInboxUrl || follower.inboxUrl);
      }

      Promise.allSettled(
        Array.from(uniqueDeliveryInboxes).map((inboxUrl) => {
          deliverActivity({
            inboxUrl,
            activity: activityPayload,
          });
        }),
      ).then((results) => {
        const deliveredCount = results.filter(
          (r) => r.status === "fulfilled",
        ).length;
        console.log("Status", deliveredCount);
      });

      return reply
        .status(201)
        .send({ ...newPost, idUri: postUri, url: postUri });
    }
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
      idUri: post.id,
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
