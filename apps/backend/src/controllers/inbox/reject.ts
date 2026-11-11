import { InboxActivity } from "../../types/index.js";
import {
  checkIfLocalActorIsFollowing,
  removeFollowingEntry,
  getFollowingByActivityId,
} from "../../db/queries/following.js";
import { markRelayRejected } from "../../db/queries/relays.js";
import { userEndpoints } from "../../activitypub/actor.js";
import { parseRelayIdFromFollowActivityId } from "../../utils/activityId.js";

const followActivityIdFrom = (object: InboxActivity["object"]) => {
  if (typeof object === "string") return object;
  if (object?.type === "Follow") return object.id;
  return undefined;
};

export const handleRejectActivity = async (activity: InboxActivity) => {
  const followActivityId = followActivityIdFrom(activity.object);
  if (followActivityId) {
    const relayId = parseRelayIdFromFollowActivityId(followActivityId);
    if (relayId) {
      await markRelayRejected(relayId);
      return;
    }
  }

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
