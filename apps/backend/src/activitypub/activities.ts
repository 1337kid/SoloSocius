import { userEndpoints } from "../activitypub/actor.js";
import { OutboxActivity } from "../types/index.js";
import { generateProfileUpdateActivityId } from "../utils/activityId.js";
import { InstanceActorObject } from "../types/index.js";
import { generateActorObject } from "./actor.js";

export const createActivity = (
  activityId: string,
  type: string,
  object: any,
) => {
  return {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: activityId,
    type: type,
    actor: userEndpoints.actorUri,
    object: object,
    to: ["https://www.w3.org/ns/activitystreams#Public"],
  };
};

export const createProfileUpdateActivity = (params: InstanceActorObject) => {
  let object = generateActorObject(params);
  delete (object as any)["@context"];

  const activityId = generateProfileUpdateActivityId();

  return createActivity(activityId, "Update", object);
};

export const createNoteActivity = (params: OutboxActivity) => {
  return {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: `${params.idUri}/activity`,
    type: "Create",
    actor: userEndpoints.actorUri,
    to: ["https://www.w3.org/ns/activitystreams#Public"],
    cc: [userEndpoints.followers],
    object: {
      id: params.idUri,
      type: "Note",
      summary: null,
      inReplyTo: params.inReplyTo,
      published: params.createdAt.toISOString(),
      url: params.url,
      actor: userEndpoints.actorUri,
      to: ["https://www.w3.org/ns/activitystreams#Public"],
      cc: [userEndpoints.followers],
      content: params.content,
    },
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

export const createNotePayload = ({
  idUri,
  createdAt,
  content,
  url,
}: {
  idUri: string;
  createdAt: Date;
  content: string;
  url: string;
}) => {
  return {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: idUri,
    type: "Note",
    published: createdAt.toISOString(),
    url: idUri,
    actor: userEndpoints.actorUri,
    attributedTo: userEndpoints.actorUri,
    to: ["https://www.w3.org/ns/activitystreams#Public"],
    cc: [userEndpoints.followers],
    content: content,
  };
};

export const createNoteUpdatePayload = ({
  idUri,
  createdAt,
  updatedAt,
  content,
}: {
  idUri: string;
  createdAt: Date;
  updatedAt: Date;
  content: string;
}) => {
  let { "@context": _context, ...notePayload } = createNotePayload({
    idUri,
    createdAt,
    content,
    url: idUri,
  });

  (notePayload as any).updated = updatedAt.toISOString();

  return {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: `${idUri}/activity/update-${Date.now()}`,
    type: "Update",
    actor: userEndpoints.actorUri,
    to: ["https://www.w3.org/ns/activitystreams#Public"],
    object: notePayload,
  };
};

export const createDeleteActivity = (idUri: string) => {
  return {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: `${idUri}/activity/delete`,
    type: "Delete",
    actor: userEndpoints.actorUri,
    to: ["https://www.w3.org/ns/activitystreams#Public"],
    object: {
      id: idUri,
      type: "Tombstone",
    },
  };
};

export const createInteractionActivity = (
  activityId: string,
  activityType: "Like" | "Announce",
  targetPostUri: string,
) => {
  const activity = {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: activityId,
    type: activityType,
    actor: userEndpoints.actorUri,
    object: targetPostUri,
  };

  if (activityType === "Announce") {
    return {
      ...activity,
      to: ["https://www.w3.org/ns/activitystreams#Public"],
    };
  }

  return activity;
};
