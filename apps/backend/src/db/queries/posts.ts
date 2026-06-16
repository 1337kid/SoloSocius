import { posts } from "../schema.js";
import { eq } from "drizzle-orm";
import { RemotePostInput } from "../../types/activitypub.js";
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