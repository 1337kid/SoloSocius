import { InboxActivity } from "../../types/index.js";
import {
  addInteractionEntry,
  findInteractionByActivityId,
} from "../../db/queries/interactions.js";
import { createNotificationEntry } from "../../db/queries/notifications.js";
import { createTimelineEntry } from "../../db/queries/timeline.js";
import { remotePostLookup } from "../../utils/activitypub.js";
import { checkIfLocalActorIsFollowing } from "../../db/queries/following.js";

export const handleAnnounceActivity = async (activity: InboxActivity) => {
  try {
    if (!(await checkIfLocalActorIsFollowing(activity.actor))) return;

    const objectUri =
      typeof activity.object === "string"
        ? activity.object
        : activity.object?.id;

    if (!objectUri) return;

    const existingInteraction = await findInteractionByActivityId(activity.id);

    if (existingInteraction) return;

    let post = await remotePostLookup(objectUri);

    if (!post) return;

    await addInteractionEntry({
      type: "boost",
      activityId: activity.id,
      actorUri: activity.actor,
      postUri: post.idUri,
    });

    await createTimelineEntry({
      type: "boost",
      actorUri: activity.actor,
      postUri: post.idUri,
    });

    if (post.isLocal) {
      await createNotificationEntry({
        type: "boost",
        actorUri: activity.actor,
        targetPostUri: post.idUri,
        activityId: activity.id,
      });
    }
  } catch (error) {
    console.error("Error handling Announce activity:", error);
  }
};
