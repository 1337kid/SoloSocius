import {
  getFollowingByActivityId,
  markFollowingAsAccepted,
} from "../../db/queries/following.js";
import { markRelayAccepted } from "../../db/queries/relays.js";
import { InboxActivity } from "../../types/index.js";
import { parseRelayIdFromFollowActivityId } from "../../utils/activityId.js";

export const handleAcceptActivity = async (activity: InboxActivity) => {
  const acceptedActivityId =
    typeof activity.object === "string" ? activity.object : activity.object.id;

  const relayId = parseRelayIdFromFollowActivityId(acceptedActivityId);
  if (relayId) {
    await markRelayAccepted(relayId);
    return;
  }

  const follow = await getFollowingByActivityId(acceptedActivityId);

  if (follow) {
    await markFollowingAsAccepted(follow.followedActorUri);
  }
};
