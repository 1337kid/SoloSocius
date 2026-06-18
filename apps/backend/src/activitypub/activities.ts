import { uuidv7 } from "uuidv7";
import { userEndpoints } from "../activitypub/actor.js";
import { OutboxActivity } from "../types/index.js";

export const createActivity = (type: string, object: any) => {
  return {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: `${userEndpoints.activities}${uuidv7()}`,
    type: type,
    actor: userEndpoints.actorUri,
    object: object,
  };
};

export const createOutboxActivity = (params: OutboxActivity) => {
  return {
    id: `${params.idUri}/activity`,
    type: "Create",
    actor: userEndpoints.actorUri,
    published: params.createdAt.toISOString(),
    to: ["https://www.w3.org/ns/activitystreams#Public"],
    cc: [userEndpoints.followers],
    object: {
      id: params.idUri,
      type: "Note",
      summary: null,
      inReplyTo: params.inReplyTo,
      published: params.createdAt.toISOString(),
      url: params.url || `${userEndpoints.home}/posts/${params.id}`,
      to: ["https://www.w3.org/ns/activitystreams#Public"],
      cc: [userEndpoints.followers],
      content: params.content,
    },
  };
};
