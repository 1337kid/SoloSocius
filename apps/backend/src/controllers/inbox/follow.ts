import { createActivity } from "../../activitypub/activities.js";
import { createFollowerEntry } from "../../db/queries/followers.js";
import { ActivityObject } from "../../types/index.js";
import { deliverActivity, remoteActorLookup } from "../../utils/activitypub.js";

interface FollowActivty {
  id: string;
  type: "Follow";
  actor: string;
  object: ActivityObject;
}

export const handleFollowActivity = async (activity: FollowActivty) => {
  const actorToFollow =
    typeof activity.object === "string" ? activity.object : activity.object.id;

  const actorLookup = await remoteActorLookup(actorToFollow);

  await createFollowerEntry({
    followerActorUri: actorLookup.actorUri,
    incomingFollowActivityId: activity.id,
  });

  const acceptActivity = createActivity("Accept", activity);

  await deliverActivity({
    inboxUrl: actorLookup.inboxUrl,
    activity: acceptActivity,
  });
};
