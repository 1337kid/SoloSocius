import { uuidv7 } from "uuidv7";
import { DOMAIN } from "../config/env.js";

export const createActivity = (type: string, object: any) => {
  return {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: `https://${DOMAIN}/activities/${uuidv7()}`,
    type: type,
    actor: `https://${DOMAIN}/actor`,
    object: object,
  };
};
