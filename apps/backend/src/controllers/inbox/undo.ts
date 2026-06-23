import { ActivityObject } from "../../types/index.js";
import {
  getFollowerByActivityId,
  removeFollowerEntry,
} from "../../db/queries/followers.js";
import { findInteractionByActivityId } from "../../db/queries/interactions.js";
import { removeInteractionAndDecrementLikeCount } from "../../db/queries/posts.js";

interface UndoActivity {
  id: string;
  actor: string;
  type: "Undo";
  object: ActivityObject;
}

export const handleUndoActivity = async (activity: UndoActivity) => {
  if (typeof activity.object !== "string") {
    switch (activity.object?.type) {
      case "Follow":
        const follower = await getFollowerByActivityId(activity.object.id);
        if (follower) await removeFollowerEntry(follower.actorUri);
        break;

      case "Like":
        const interaction = await findInteractionByActivityId(
          activity.object.id,
        );

        if (interaction)
          removeInteractionAndDecrementLikeCount(
            interaction.postUri,
            interaction.id,
          );

      default:
        return;
    }
  }
};
