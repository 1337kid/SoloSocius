import { userEndpoints } from "../../activitypub/actor.js";
import { createNotificationEntry } from "../../db/queries/notifications.js";
import {
  getPostFromDB,
  incrementPostReplyCount,
  storeRemotePost,
} from "../../db/queries/posts.js";
import { InboxActivity } from "../../types/index.js";
import type { MediaItem } from "../../db/schema.js";
import { parseMediaItems, remotePostLookup } from "../../utils/activitypub.js";
import { createAndPublishTimelineEntry } from "../../utils/timeline.js";

export const handleCreateActivity = async (activity: InboxActivity) => {
  if (typeof activity.object === "string") return;

  const nestedObject = activity.object;

  switch (nestedObject.type) {
    case "Note":
      const post = await remotePostLookup(nestedObject.id);

      if (!post) return;

      await createAndPublishTimelineEntry(activity.actor, post.idUri, "post");

      if (nestedObject.inReplyTo) {
        const localParentPost = await getPostFromDB(nestedObject.inReplyTo);

        if (localParentPost?.isLocal) {
          await incrementPostReplyCount(localParentPost.idUri);

          await createNotificationEntry({
            type: "reply",
            actorUri: activity.actor,
            targetPostUri: localParentPost.idUri,
            activityId: nestedObject.id,
          });
          return;
        }
      }

      if (Array.isArray(nestedObject.tag)) {
        const isMentioned = nestedObject.tag.some(
          (t: any) => t.type === "Mention" && t.href === userEndpoints.actorUri,
        );

        if (isMentioned)
          await createNotificationEntry({
            type: "mention",
            actorUri: activity.actor,
            targetPostUri: nestedObject.inReplyTo || null,
            activityId: nestedObject.id,
          });
      }
  }
};
