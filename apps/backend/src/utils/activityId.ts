import { userEndpoints } from "../activitypub/actor.js";
import { uuidv7 } from "uuidv7";

export const generateFollowActivityId = () => {
  return `${userEndpoints.actorUri}/follow/${uuidv7()}`;
};

export const generateAcceptActivityId = () => {
  return `${userEndpoints.actorUri}/accept/${uuidv7()}`;
};

export const generateRejectActivityId = () => {
  return `${userEndpoints.actorUri}/reject/${uuidv7()}`;
};

export const generateInteractionActivityId = (type: string) => {
  return `${userEndpoints.activities}/${type}/${uuidv7()}`;
};

export const generateProfileUpdateActivityId = () => {
  return `${userEndpoints.actorUri}/profile-update/${uuidv7()}`;
};

export const generateRelayFollowActivityId = (relayId: string) => {
  return `${userEndpoints.actorUri}/relays/${relayId}/follow`;
};

export const parseRelayIdFromFollowActivityId = (activityId: string) => {
  const prefix = `${userEndpoints.actorUri}/relays/`;
  const suffix = "/follow";

  if (!activityId.startsWith(prefix) || !activityId.endsWith(suffix)) {
    return null;
  }

  const relayId = activityId.slice(prefix.length, -suffix.length);
  return relayId.length > 0 ? relayId : null;
};
