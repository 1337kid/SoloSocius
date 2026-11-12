import {
  getFollowingByActivityId,
  markFollowingAsAccepted,
} from "../../db/queries/following.js";
import {
  findRelayByFollowActivityId,
  markRelayAccepted,
} from "../../db/queries/relays.js";
import { InboxActivity } from "../../types/index.js";

export const handleAcceptActivity = async (activity: InboxActivity) => {
  const acceptedActivityId =
    typeof activity.object === "string" ? activity.object : activity.object.id;

  const relay = await findRelayByFollowActivityId(acceptedActivityId);
  if (relay) {
    await markRelayAccepted(relay.id, activity.actor);
    return;
  }

  const follow = await getFollowingByActivityId(acceptedActivityId);

  if (follow) {
    await markFollowingAsAccepted(follow.followedActorUri);
  }
};
