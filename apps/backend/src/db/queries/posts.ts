import { posts } from "../schema.js";
import { eq, desc, count, inArray } from "drizzle-orm";
import { RemotePostInput } from "../../types/index.js";
import { db } from "../index.js";
import { userEndpoints } from "../../activitypub/actor.js";

export const storeRemotePost = async (data: RemotePostInput) => {
  await db
    .insert(posts)
    .values({
      actorId: data.actorUri,
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
    });
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
      actorId: userEndpoints.actorUri,
      content: content,
      isLocal: true,
      idUri: "",
      inReplyTo: inReplyTo || null,
    })
    .returning();
  return newPost;
};

export const updateUserPostUri = async (postId: string) => {
  const postUri = `${userEndpoints.actorUri}posts/${postId}`;

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

export const deletePostFromDB = async (id: string) => {
  await db.delete(posts).where(eq(posts.id, id));
};

export const getPostsByActorUris = async (
  actorUris: string[],
  limit: number,
  offset: number,
) => {
  return await db
    .select()
    .from(posts)
    .where(inArray(posts.actorId, actorUris))
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);
};
