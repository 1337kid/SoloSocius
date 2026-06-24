import { InboxActivity } from "../../types/index.js";
import {
  getFollowerByActivityId,
  removeFollowerEntry,
} from "../../db/queries/followers.js";
import { findInteractionByActivityId } from "../../db/queries/interactions.js";
import {
  removeBoostByActivityId,
  removeInteractionAndDecrementLikeCount,
} from "../../db/queries/transactions.js";

export const handleUndoActivity = async (activity: InboxActivity) => {
  if (typeof activity.object !== "string") {
    switch (activity.object?.type) {
      case "Follow":
        const follower = await getFollowerByActivityId(activity.object.id);
        if (follower) await removeFollowerEntry(follower.actorUri);
        break;

      case "Like":
        const likeInteraction = await findInteractionByActivityId(
          activity.object.id,
        );

        if (likeInteraction && likeInteraction.type === "like") {
          await removeInteractionAndDecrementLikeCount(
            likeInteraction.postUri,
            likeInteraction.id,
          );
        }
        break;

      case "Announce":
        await removeBoostByActivityId(activity.object.id);
        break;

      default:
        return;
    }
  }
};
