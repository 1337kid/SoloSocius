import { FastifyRequest, FastifyReply } from "fastify";
import { getUserPosts, getUserPostsCount } from "../db/queries/posts.js";
import {
  createOrderedCollection,
  createOrderedCollectionPage,
} from "../activitypub/collections.js";
import { createOutboxActivity } from "../activitypub/activities.js";
import { userEndpoints } from "../activitypub/actor.js";
import type { OptionalPageQuery } from "../validations/pagination.val.js";

const PAGE_SIZE = 20;

export const handleOutboxRequest = async (
  request: FastifyRequest<{ Querystring: OptionalPageQuery }>,
  reply: FastifyReply,
) => {
  const { page } = request.query;

  try {
    const totalItems = await getUserPostsCount();

    // return metadata if no page query
    if (page === undefined) {
      const collectionWrapper = createOrderedCollection(userEndpoints.outbox, {
        totalItems,
        first: "1",
        last: `${Math.max(1, Math.ceil(totalItems / PAGE_SIZE))}`,
      });

      return reply
        .type("application/activity+json; charset=utf-8")
        .send(collectionWrapper);
    }

    const offsetValue = (page - 1) * PAGE_SIZE;
    const localPosts = await getUserPosts(offsetValue, PAGE_SIZE);

    const orderedItems = localPosts.map((post) =>
      createOutboxActivity({
        id: post.id,
        idUri: post.idUri,
        createdAt: post.createdAt,
        inReplyTo: post.inReplyTo,
        content: post.content,
        url: post.url,
        attachments: post.mediaItems,
      }),
    );

    const hasMoreItems = totalItems > page * PAGE_SIZE;

    const collectionPage = createOrderedCollectionPage(
      userEndpoints.outbox,
      page,
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
