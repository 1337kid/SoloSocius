import { actors, interactions, posts } from "../schema.js";
import { eq, desc, count, inArray, and, sql } from "drizzle-orm";
import { RemotePostInput } from "../../types/index.js";
import { db } from "../index.js";
import { userEndpoints } from "../../activitypub/actor.js";
import type { MediaItem } from "../schema.js";
import { getCache, setCache } from "../../cache/redis.js";
import { CacheKeys, TTL } from "../../cache/keys.js";
import { invalidateLocalActorCache } from "../../cache/invalidateLocalActor.js";
import { alias } from "drizzle-orm/pg-core";

export const storeRemotePost = async (data: RemotePostInput) => {
  const [post] = await db
    .insert(posts)
    .values({
      actorUri: data.actorUri,
      idUri: data.idUri,
      content: data.content,
      isLocal: false,
      inReplyTo: data.inReplyTo,
      url: data.url,
      createdAt: data.published ? new Date(data.published) : new Date(),
      mediaItems: data.mediaItems,
    })
    .onConflictDoUpdate({
      target: posts.idUri,
      set: {
        content: data.content,
        inReplyTo: data.inReplyTo,
        mediaItems: data.mediaItems,
      },
    })
    .returning();
  return post;
};

export const getPostFromDB = async (idUri: string) => {
  const post = await db.query.posts.findFirst({
    where: eq(posts.idUri, idUri),
    with: {
      actor: true,
    },
  });
  return post;
};

export const getPostById = async (id: string) => {
  const post = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return post[0];
};

export const getUserPostsCount = async () => {
  const [totalResult] = await db
    .select({ value: count() })
    .from(posts)
    .where(eq(posts.isLocal, true));

  return totalResult?.value || 0;
};

export const getUserPosts = async (offset: number, limit: number) => {
  return await db
    .select()
    .from(posts)
    .where(eq(posts.isLocal, true))
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);
};

export const getLocalPostsCount = async () => {
  const [totalResult] = await db
    .select({ value: count() })
    .from(posts)
    .where(eq(posts.actorUri, userEndpoints.actorUri));

  return totalResult?.value || 0;
};

export const getCachedLocalPostsCount = async () => {
  const cached = await getCache<number>(CacheKeys.localPostsCount);
  if (cached !== null) return cached;

  const value = await getLocalPostsCount();
  await setCache(CacheKeys.localPostsCount, value, TTL.localCounts);
  return value;
};

export const createUserPost = async ({
  content,
  inReplyTo,
  attachments,
}: {
  content: string;
  inReplyTo?: string;
  attachments?: MediaItem[];
}) => {
  const [newPost] = await db
    .insert(posts)
    .values({
      actorUri: userEndpoints.actorUri,
      content: content,
      isLocal: true,
      idUri: "",
      inReplyTo: inReplyTo || null,
      mediaItems: attachments || [],
    })
    .returning();
  await invalidateLocalActorCache("posts");
  return newPost;
};

export const updateUserPostUri = async (postId: string) => {
  const postUri = `${userEndpoints.home}/posts/${postId}`;

  await db
    .update(posts)
    .set({
      idUri: postUri,
      url: postUri,
    })
    .where(eq(posts.id, postId));

  return postUri;
};

export const updatePostContent = async (id: string, content: string) => {
  const [updatedPost] = await db
    .update(posts)
    .set({ content })
    .where(eq(posts.id, id))
    .returning();

  return updatedPost;
};

export const deletePostById = async (id: string) => {
  await db.delete(posts).where(eq(posts.id, id));
  await invalidateLocalActorCache("posts");
};

export const removeRemoteActorPost = async (
  actorUri: string,
  postUri: string,
) => {
  await db
    .delete(posts)
    .where(and(eq(posts.actorUri, actorUri), eq(posts.idUri, postUri)));
};

export const getPostsByActorUris = async (
  actorUris: string[],
  limit: number,
  offset: number,
) => {
  return await db
    .select()
    .from(posts)
    .where(inArray(posts.actorUri, actorUris))
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);
};

export const findLocalPostByUri = async (postUri: string) => {
  return (
    await db
      .select()
      .from(posts)
      .where(and(eq(posts.isLocal, true), eq(posts.idUri, postUri)))
      .limit(1)
  )[0];
};

export const incrementPostReplyCount = async (postUri: string) => {
  await db
    .update(posts)
    .set({
      replyCount: sql`${posts.replyCount} + 1`,
    })
    .where(eq(posts.idUri, postUri));
};

const myLike = alias(interactions, "my_like");
const myBoost = alias(interactions, "my_boost");
const replyMyLike = alias(interactions, "reply_my_like");
const replyMyBoost = alias(interactions, "reply_my_boost");

export const getPostWithRepliesByPostId = async (id: string) => {
  const mainPostResult = await db
    .select({
      id: posts.id,
      idUri: posts.idUri,
      content: posts.content,
      createdAt: posts.createdAt,
      inReplyTo: posts.inReplyTo,
      mediaItems: posts.mediaItems,
      url: posts.url,
      isLocal: posts.isLocal,
      likeCount: posts.likeCount,
      boostCount: posts.boostCount,
      replyCount: posts.replyCount,
      liked: sql<boolean>`${myLike.id} IS NOT NULL`,
      boosted: sql<boolean>`${myBoost.id} IS NOT NULL`,
      actor: {
        actorUri: actors.actorUri,
        displayName: actors.displayName,
        username: actors.username,
        domain: actors.domain,
        avatarUrl: actors.avatarUrl,
      },
    })
    .from(posts)
    .innerJoin(actors, eq(actors.actorUri, posts.actorUri))
    .leftJoin(
      myLike,
      and(
        eq(myLike.postUri, posts.idUri),
        eq(myLike.actorUri, userEndpoints.actorUri),
        eq(myLike.type, "like"),
      ),
    )
    .leftJoin(
      myBoost,
      and(
        eq(myBoost.postUri, posts.idUri),
        eq(myBoost.actorUri, userEndpoints.actorUri),
        eq(myBoost.type, "boost"),
      ),
    )
    .where(eq(posts.id, id))
    .limit(1);

  if (!mainPostResult[0]) {
    return null;
  }

  const mainPost = mainPostResult[0];

  const repliesResult = await db
    .select({
      id: posts.id,
      idUri: posts.idUri,
      content: posts.content,
      createdAt: posts.createdAt,
      mediaItems: posts.mediaItems,
      url: posts.url,
      liked: sql<boolean>`${replyMyLike.id} IS NOT NULL`,
      boosted: sql<boolean>`${replyMyBoost.id} IS NOT NULL`,
      actor: {
        actorUri: actors.actorUri,
        displayName: actors.displayName,
        username: actors.username,
        domain: actors.domain,
        avatarUrl: actors.avatarUrl,
      },
    })
    .from(posts)
    .innerJoin(actors, eq(actors.actorUri, posts.actorUri))
    .leftJoin(
      replyMyLike,
      and(
        eq(replyMyLike.postUri, posts.idUri),
        eq(replyMyLike.actorUri, userEndpoints.actorUri),
        eq(replyMyLike.type, "like"),
      ),
    )
    .leftJoin(
      replyMyBoost,
      and(
        eq(replyMyBoost.postUri, posts.idUri),
        eq(replyMyBoost.actorUri, userEndpoints.actorUri),
        eq(replyMyBoost.type, "boost"),
      ),
    )
    .where(eq(posts.inReplyTo, mainPost.idUri))
    .orderBy(desc(posts.createdAt));

  return {
    ...mainPost,
    replies: repliesResult,
  };
};
