import { posts } from "../schema.js";
import { eq, desc, count } from "drizzle-orm";
import { RemotePostInput } from "../../types/index.js";
import { db } from "../index.js";

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
