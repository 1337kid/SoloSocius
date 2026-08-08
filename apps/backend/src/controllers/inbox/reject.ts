import { InboxActivity } from "../../types/index.js";
import {
  checkIfLocalActorIsFollowing,
  removeFollowingEntry,
  getFollowingByActivityId,
} from "../../db/queries/following.js";
import { userEndpoints } from "../../activitypub/actor.js";

export const handleRejectActivity = async (activity: InboxActivity) => {
  if (typeof activity.object !== "string") {
    switch (activity.object?.type) {
      case "Follow":
        let following: any = await getFollowingByActivityId(activity.object.id);

        // fallback
        if (!following && activity.object.actor === userEndpoints.actorUri) {
          following = await checkIfLocalActorIsFollowing(activity.object.actor);
        }

        if (following) await removeFollowingEntry(following.followedActorUri);

        break;

      default:
        return;
    }
  }
};
