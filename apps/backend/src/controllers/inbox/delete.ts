import { InboxActivity } from "../../types/index.js";
import { removeRemoteActorPost } from "../../db/queries/posts.js";

export const handleDeleteActivity = async (activity: InboxActivity) => {
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
