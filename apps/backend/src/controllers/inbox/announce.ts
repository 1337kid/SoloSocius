import { InboxActivity } from "../../types/index.js";
import {
  addInteractionEntry,
  findInteractionByActivityId,
} from "../../db/queries/interactions.js";
import { createNotificationEntry } from "../../db/queries/notifications.js";
import { createTimelineEntry } from "../../db/queries/timeline.js";
import { remotePostLookup } from "../../utils/activitypub.js";
import { checkIfLocalActorIsFollowing } from "../../db/queries/following.js";
import { findRelayByActorUri } from "../../db/queries/actor.js";

export const handleAnnounceActivity = async (activity: InboxActivity) => {
  try {
    const isRelay = await findRelayByActorUri(activity.actor);
    const isLocalActorFollowing = await checkIfLocalActorIsFollowing(
      activity.actor,
    );

    if (!isLocalActorFollowing && !isRelay) return;

    const objectUri =
      typeof activity.object === "string"
        ? activity.object
        : activity.object?.id;

    if (!objectUri) return;

    let post = await remotePostLookup(objectUri);

    if (!post) return;

    if (isRelay) {
      await createTimelineEntry({
        type: "post",
        actorUri: post.actorUri,
        postUri: post.idUri,
      });

      return;
    }

    const existingInteraction = await findInteractionByActivityId(activity.id);

    if (existingInteraction) return;

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
