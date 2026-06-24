import { ActivityObject } from "../../types/index.js";
import {
  getFollowerByActivityId,
  removeFollowerEntry,
} from "../../db/queries/followers.js";
import { removeRemoteActorPost } from "../../db/queries/posts.js";

interface DeleteActivity {
  id: string;
  actor: string;
  type: "Delete";
  object: ActivityObject;
}

export const handleDeleteActivity = async (activity: DeleteActivity) => {
  if (typeof activity.object !== "string") {
    switch (activity.object?.type) {
      case "Tombstone":
        await removeRemoteActorPost(activity.actor, activity.object.id);
        break;

      default:
        return;
    }
  }
};
