import { addInteractionEntry } from "../../db/queries/interactions.js";
import { createNotificationEntry } from "../../db/queries/notifications.js";
import { findLocalPostByUri } from "../../db/queries/posts.js";
import { InboxActivity } from "../../types/index.js";

export const handleLikeActivity = async (activity: InboxActivity) => {
  try {
    const likedActivityId =
      typeof activity.object === "string"
        ? activity.object
        : activity.object.id;

    const post = await findLocalPostByUri(likedActivityId);

    if (!post) return;

    await addInteractionEntry({
      type: "like",
      activityId: activity.id,
      actorUri: activity.actor,
      postUri: post.idUri,
    });

    await createNotificationEntry({
      type: "Like",
      actorUri: activity.actor,
      targetPostUri: post.idUri,
      activityId: activity.id,
    });
  } catch (error) {
    console.log(error);
    return;
  }
};
