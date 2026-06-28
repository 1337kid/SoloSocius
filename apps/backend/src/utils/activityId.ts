import { userEndpoints } from "../activitypub/actor.js";
import { uuidv7 } from "uuidv7";

export const generateFollowActivityId = () => {
  return `${userEndpoints.actorUri}/follow/${uuidv7()}`;
};

export const generateAcceptActivityId = () => {
  return `${userEndpoints.actorUri}/accept/${uuidv7()}`;
};

export const generateInteractionActivityId = (type: string) => {
  return `${userEndpoints.activities}/${type}/${uuidv7()}`;
};
