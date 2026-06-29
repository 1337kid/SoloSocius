import { FastifyRequest, FastifyReply } from "fastify";
import { getUserPosts, getUserPostsCount } from "../db/queries/posts.js";
import {
  createOrderedCollection,
  createOrderedCollectionPage,
} from "../activitypub/collections.js";
import { createOutboxActivity } from "../activitypub/activities.js";
import { userEndpoints } from "../activitypub/actor.js";

const PAGE_SIZE = 20;

export const handleOutboxRequest = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { page } = request.query as { page?: string };

  try {
    const totalItems = await getUserPostsCount();

    // return metadata if no page query
    if (!page) {
      const collectionWrapper = createOrderedCollection(userEndpoints.outbox, {
        totalItems,
        first: "1",
        last: `${Math.max(1, Math.ceil(totalItems / PAGE_SIZE))}`,
      });

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
    const localPosts = await getUserPosts(offsetValue, PAGE_SIZE);

    const orderedItems = localPosts.map((post) =>
      createOutboxActivity({
        id: post.id,
        idUri: post.idUri,
        createdAt: post.createdAt,
        inReplyTo: post.inReplyTo,
        content: post.content,
        url: post.url,
      }),
    );

    const hasMoreItems = totalItems > pageNumber * PAGE_SIZE;

    const collectionPage = createOrderedCollectionPage(
      userEndpoints.outbox,
      pageNumber,
      totalItems,
      orderedItems,
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
