import { createActivity } from "../../activitypub/activities.js";
import { createFollowerEntry } from "../../db/queries/followers.js";
import { ActivityObject } from "../../types/index.js";
import { generateAcceptActivityId } from "../../utils/activityId.js";
import { deliverActivity, remoteActorLookup } from "../../utils/activitypub.js";

interface FollowActivty {
  id: string;
  type: "Follow";
  actor: string;
  object: ActivityObject;
}

export const handleFollowActivity = async (activity: FollowActivty) => {
  const actorToFollow = activity.actor;

  const actorLookup = await remoteActorLookup(actorToFollow);

  await createFollowerEntry({
    followerActorUri: actorLookup.actorUri,
    incomingFollowActivityId: activity.id,
  });

  const activityId = generateAcceptActivityId();
  const acceptActivity = createActivity(activityId, "Accept", activity);

  await deliverActivity({
    inboxUrl: actorLookup.inboxUrl,
    activity: acceptActivity,
  });
};
