import { createActivity } from "../../activitypub/activities.js";
import { createFollowerEntry } from "../../db/queries/followers.js";
import { InboxActivity } from "../../types/index.js";
import { generateAcceptActivityId } from "../../utils/activityId.js";
import { deliverActivity, remoteActorLookup } from "../../utils/activitypub.js";
import { isManuallyApprovingFollowers } from "../../db/queries/actor.js";

export const handleFollowActivity = async (activity: InboxActivity) => {
  const actorToFollow = activity.actor;

  const actorLookup = await remoteActorLookup(actorToFollow);

  const manuallyApprovingFollowers = await isManuallyApprovingFollowers();

  await createFollowerEntry({
    followerActorUri: actorLookup.actorUri,
    incomingFollowActivityId: activity.id,
    accepted: manuallyApprovingFollowers ? false : true,
  });

  if (!manuallyApprovingFollowers) {
    const activityId = generateAcceptActivityId();
    const acceptActivity = createActivity(activityId, "Accept", activity);

    await deliverActivity({
      inboxUrl: actorLookup.inboxUrl,
      activity: acceptActivity,
    });
  }
};
