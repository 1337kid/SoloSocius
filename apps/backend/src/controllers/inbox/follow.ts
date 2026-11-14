import {
  createAcceptActivity,
  createRelayAcceptActivity,
} from "../../activitypub/activities.js";
import { createFollowerEntry } from "../../db/queries/followers.js";
import { InboxActivity } from "../../types/index.js";
import { remoteActorLookup } from "../../utils/activitypub.js";
import { isManuallyApprovingFollowers } from "../../db/queries/actor.js";
import jobWorker, { JOB_TYPES } from "../../jobs/index.js";
import { userEndpoints, systemUserEndpoints } from "../../activitypub/actor.js";

export const handleFollowActivity = async (activity: InboxActivity) => {
  const targetActor = activity.object;

  const isUserActor = targetActor === userEndpoints.actorUri;

  const isSystemActor = targetActor === systemUserEndpoints.actorUri;
  if (!isUserActor && !isSystemActor) return;

  const followerActorUri = activity.actor;

  const actorLookup = await remoteActorLookup(followerActorUri);

  if (isSystemActor && actorLookup.type !== "relay") return;

  const manuallyApprovingFollowers = isUserActor
    ? await isManuallyApprovingFollowers()
    : false;

  await createFollowerEntry({
    followerActorUri: actorLookup.actorUri,
    incomingFollowActivityId: activity.id,
    accepted: !manuallyApprovingFollowers,
  });

  if (!manuallyApprovingFollowers) {
    const acceptActivity = isSystemActor
      ? createRelayAcceptActivity(activity)
      : createAcceptActivity(activity);

    jobWorker.createJob(JOB_TYPES.DELIVER_ACTIVITY, {
      inboxUrl: actorLookup.inboxUrl,
      activity: acceptActivity,
      isSystemActor,
    });
  }
};
