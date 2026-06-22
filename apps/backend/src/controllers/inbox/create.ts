import { createActivity } from "../../activitypub/activities.js";
import { userEndpoints } from "../../activitypub/actor.js";
import { createFollowerEntry } from "../../db/queries/followers.js";
import { createNotificationEntry } from "../../db/queries/notifications.js";
import { getPostFromDB, storeRemotePost } from "../../db/queries/posts.js";
import { ActivityObject } from "../../types/index.js";
import { deliverActivity, remoteActorLookup } from "../../utils/activitypub.js";

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

      if (nestedObject.inReplyTo) {
        const localParentPost = await getPostFromDB(nestedObject.inReplyTo);

        if (localParentPost && localParentPost.isLocal) {
          await createNotificationEntry({
            type: "mention",
            actorId: activity.actor,
            targetPostUri: localParentPost.idUri,
            linkedNotificationUri: nestedObject.id,
          });
        }
      }

      if (Array.isArray(nestedObject.tag)) {
        const isMentioned = nestedObject.tag.some(
          (t: any) => t.type === "Mention" && t.href === userEndpoints.actorUri,
        );

        if (isMentioned)
          await createNotificationEntry({
            type: "mention",
            actorId: activity.actor,
            targetPostUri: nestedObject.inReplyTo || null,
            linkedNotificationUri: nestedObject.id,
          });
      }
  }
};
