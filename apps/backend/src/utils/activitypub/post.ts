import { getPostFromDB, storeRemotePost } from "../../db/queries/posts.js";
import type { MediaItem } from "../../db/schema.js";
import { remoteActorLookup } from "./actor.js";
import { remoteFetch } from "./fetch.js";
import { parseMediaItems } from "./media.js";

export const remotePostLookup = async (postUri: string) => {
  const post = await getPostFromDB(postUri);

  if (post) return post;

  const lookup = await remoteFetch(postUri);

  if (!lookup.ok)
    throw new Error("Could not discover target remote post path.");

  const data = await lookup.json();

  await remoteActorLookup(data.attributedTo);

  let inReplyToPost = null;

  if (data.inReplyTo) {
    inReplyToPost = await getPostFromDB(data.inReplyTo);

    if (!inReplyToPost) {
      inReplyToPost = await remotePostLookup(data.inReplyTo);
    }
  }

  let mediaItems: MediaItem[] = parseMediaItems(data.attachment);

  const newPost = await storeRemotePost({
    actorUri: data.attributedTo,
    idUri: postUri,
    content: data.content,
    inReplyTo: inReplyToPost?.idUri || null,
    url: data.url,
    published: data.published,
    mediaItems,
  });
  return newPost;
};
