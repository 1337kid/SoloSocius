import { ActivityObject } from "../../types/index.js";
import {
  getFollowerByActivityId,
  removeFollowerEntry,
} from "../../db/queries/followers.js";

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
    }
  }
};
