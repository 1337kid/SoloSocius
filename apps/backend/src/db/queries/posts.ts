import { interactions, posts } from "../schema.js";
import { eq, desc, count, inArray, and, sql } from "drizzle-orm";
import { RemotePostInput } from "../../types/index.js";
import { db } from "../index.js";
import { userEndpoints } from "../../activitypub/actor.js";

export const storeRemotePost = async (data: RemotePostInput) => {
  await db
    .insert(posts)
    .values({
      actorUri: data.actorUri,
      idUri: data.idUri,
      content: data.content,
      isLocal: false,
      inReplyTo: data.inReplyTo,
      url: data.url,
      createdAt: data.published ? new Date(data.published) : new Date(),
    })
    .onConflictDoUpdate({
      target: posts.idUri,
      set: {
        content: data.content,
        inReplyTo: data.inReplyTo,
      },
    })
    .returning();
};

export const getPostFromDB = async (idUri: string) => {
  const post = await db
    .select()
    .from(posts)
    .where(eq(posts.idUri, idUri))
    .limit(1);
  return post[0];
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

export const createUserPost = async ({
  content,
  inReplyTo,
}: {
  content: string;
  inReplyTo?: string;
}) => {
  const [newPost] = await db
    .insert(posts)
    .values({
      actorUri: userEndpoints.actorUri,
      content: content,
      isLocal: true,
      idUri: "",
      inReplyTo: inReplyTo || null,
    })
    .returning();
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

export const incrementPostLikeCount = async (postUri: string) => {
  await db
    .update(posts)
    .set({
      likeCount: sql`${posts.likeCount} + 1`,
    })
    .where(eq(posts.idUri, postUri));
};

export const removeInteractionAndDecrementLikeCount = async (
  postUri: string,
  interactionId: string,
) => {
  await db.transaction(async (tx) => {
    await tx.delete(interactions).where(eq(interactions.id, interactionId));

    await tx
      .update(posts)
      .set({
        likeCount: sql`GREATEST(${posts.likeCount} - 1, 0)`,
      })
      .where(eq(posts.idUri, postUri));
  });
};

export const incrementPostBoostCount = async (postUri: string) => {
  await db
    .update(posts)
    .set({
      boostCount: sql`${posts.boostCount} + 1`,
    })
    .where(eq(posts.idUri, postUri));
};

export const removeInteractionAndDecrementBoostCount = async (
  postUri: string,
  interactionId: string,
) => {
  await db.transaction(async (tx) => {
    await tx.delete(interactions).where(eq(interactions.id, interactionId));

    await tx
      .update(posts)
      .set({
        boostCount: sql`GREATEST(${posts.boostCount} - 1, 0)`,
      })
      .where(eq(posts.idUri, postUri));
  });
};
