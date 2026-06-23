import { addInteractionEntry } from "../../db/queries/interactions.js";
import { createNotificationEntry } from "../../db/queries/notifications.js";
import {
  findLocalPostByUri,
  incrementPostLikeCount,
} from "../../db/queries/posts.js";
import { ActivityObject } from "../../types/index.js";

interface LikeActivity {
  id: string;
  actor: string;
  type: "Like";
  object: ActivityObject;
}

export const handleLikeActivity = async (activity: LikeActivity) => {
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

    await incrementPostLikeCount(post.idUri);

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
