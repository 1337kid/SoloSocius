import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "../index.js";
import { actors, interactions, posts, timelineEvents } from "../schema.js";
import { userEndpoints } from "../../activitypub/actor.js";
import { alias } from "drizzle-orm/pg-core";

interface timelineEvent {
  type: "post" | "boost";
  actorUri: string;
  postUri: string;
}

export const createTimelineEntry = async ({
  type,
  actorUri,
  postUri,
}: timelineEvent) => {
  await db.insert(timelineEvents).values({
    type,
    actorUri,
    postUri,
  });
};

export const removeTimelineEntry = async (postUri: string) => {
  await db.delete(timelineEvents).where(eq(timelineEvents.postUri, postUri));
};

export const removeTimelineBoostEntry = async (
  postUri: string,
  actorUri: string,
) => {
  await db
    .delete(timelineEvents)
    .where(
      and(
        eq(timelineEvents.postUri, postUri),
        eq(timelineEvents.actorUri, actorUri),
        eq(timelineEvents.type, "boost"),
      ),
    );
};

export const getFeedEvents = async (
  actorUris: string[],
  limit: number,
  offset: number,
) => {
  return await db.query.timelineEvents.findMany({
    with: {
      actor: {
        columns: {
          actorUri: true,
          avatarUrl: true,
          username: true,
          domain: true,
        },
      },
      post: {
        with: {
          actor: {
            columns: {
              actorUri: true,
              avatarUrl: true,
              username: true,
              domain: true,
            },
          },
        },
      },
    },
    where: inArray(timelineEvents.actorUri, actorUris),
    orderBy: desc(timelineEvents.createdAt),
    limit,
    offset,
  });
};

const actor = alias(actors, "actor");
const postActor = alias(actors, "post_actor");
const parentPost = alias(posts, "parent_post");
const parentActor = alias(actors, "parent_actor");

const myLike = alias(interactions, "my_like");
const myBoost = alias(interactions, "my_boost");

export const getProfileTimeline = async (
  limit: number,
  offset: number,
) => {
  return db
    .select({
      event: {
        createdAt: timelineEvents.createdAt,
        type: timelineEvents.type,
      },

      actor: {
        avatarUrl: actor.avatarUrl,
        displayName: actor.displayName,
        username: actor.username,
        domain: actor.domain,
      },

      post: {
        id: posts.id,
        idUri: posts.idUri,
        url: posts.url || posts.idUri,
        content: posts.content,
        createdAt: posts.createdAt,

        // likeCount: posts.likeCount,
        // boostCount: posts.boostCount,

        liked: sql<boolean>`${myLike.id} IS NOT NULL`,
        boosted: sql<boolean>`${myBoost.id} IS NOT NULL`,
      },

      postActor: {
        actorUri: postActor.actorUri,
        avatarUrl: postActor.avatarUrl,
        displayName: postActor.displayName,
        username: postActor.username,
        domain: postActor.domain,
      },

      parentPost: {
        url: parentPost.url || parentPost.idUri,
        content: parentPost.content,
      },

      parentActor: {
        avatarUrl: parentActor.avatarUrl,
        displayName: parentActor.displayName,
        username: parentActor.username,
        domain: parentActor.domain,
      },
    })
    .from(timelineEvents)

    // Event actor
    .innerJoin(actor, eq(actor.actorUri, timelineEvents.actorUri))

    // Timeline post
    .innerJoin(posts, eq(posts.idUri, timelineEvents.postUri))

    // Author of the post
    .innerJoin(postActor, eq(postActor.actorUri, posts.actorUri))

    // Local user's Like
    .leftJoin(
      myLike,
      and(
        eq(myLike.postUri, posts.idUri),
        eq(myLike.actorUri, userEndpoints.actorUri),
        eq(myLike.type, "like"),
      ),
    )

    // Local user's Boost
    .leftJoin(
      myBoost,
      and(
        eq(myBoost.postUri, posts.idUri),
        eq(myBoost.actorUri, userEndpoints.actorUri),
        eq(myBoost.type, "boost"),
      ),
    )

    // parent post information
    .leftJoin(parentPost, eq(parentPost.idUri, posts.inReplyTo))
    .leftJoin(parentActor, eq(parentActor.actorUri, parentPost.actorUri))

    .where(eq(timelineEvents.actorUri, userEndpoints.actorUri))
    .orderBy(desc(timelineEvents.createdAt))
    .limit(limit)
    .offset(offset);
};