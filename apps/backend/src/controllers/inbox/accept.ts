import { FastifyReply } from "fastify";
import {
  getFollowingByActivityId,
  markFollowingAsAccepted,
} from "../../db/queries/following.js";
import { ActivityObject } from "../../types/index.js";

interface AcceptActivity {
  id: string;
  actor: string;
  type: "Accept";
  object: ActivityObject;
}

export const handleAcceptActivity = async (activity: AcceptActivity) => {
  if (!activity.object) return;

  const acceptedActivityId =
    typeof activity.object === "string" ? activity.object : activity.object.id;

  const follow = await getFollowingByActivityId(acceptedActivityId);

  if (follow) {
    await markFollowingAsAccepted(follow.followedActorUri);
  }
};
