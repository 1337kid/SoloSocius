import { userEndpoints } from "../../activitypub/actor.js";
import { createNotificationEntry } from "../../db/queries/notifications.js";
import { getPostFromDB, storeRemotePost } from "../../db/queries/posts.js";
import { createTimelineEntry } from "../../db/queries/timeline.js";
import { ActivityObject } from "../../types/index.js";

interface CreateActivity {
  id: string;
  type: "Create";
  actor: string;
  object: ActivityObject;
}

export const handleCreateActivity = async (activity: CreateActivity) => {
  if (typeof activity.object === "string") return;

  const nestedObject = activity.object;

  switch (nestedObject.type) {
    case "Note":
      await storeRemotePost({
        actorUri: activity.actor,
        idUri: nestedObject.id,
        content: nestedObject.content || "",
        inReplyTo: nestedObject.inReplyTo || null,
        url: nestedObject.url || null,
        published: nestedObject.published,
      });

      await createTimelineEntry({
        actorUri: activity.actor,
        postUri: nestedObject.id,
        type: "post",
      });

      if (nestedObject.inReplyTo) {
        const localParentPost = await getPostFromDB(nestedObject.inReplyTo);

        if (localParentPost?.isLocal) {
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
