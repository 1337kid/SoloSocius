import { userEndpoints } from "../activitypub/actor.js";
import { uuidv7 } from "uuidv7";

export const generateFollowActivityId = () => {
  return `${userEndpoints.actorUri}/follow/${uuidv7()}`;
};
