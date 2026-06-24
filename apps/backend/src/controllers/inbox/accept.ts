import {
  getFollowingByActivityId,
  markFollowingAsAccepted,
} from "../../db/queries/following.js";
import { InboxActivity } from "../../types/index.js";

export const handleAcceptActivity = async (activity: InboxActivity) => {
  const acceptedActivityId =
    typeof activity.object === "string" ? activity.object : activity.object.id;

  const follow = await getFollowingByActivityId(acceptedActivityId);

  if (follow) {
    await markFollowingAsAccepted(follow.followedActorUri);
  }
};
