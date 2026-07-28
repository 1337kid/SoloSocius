import { userEndpoints } from "../activitypub/actor.js";
import { OutboxActivity } from "../types/index.js";
import { generateProfileUpdateActivityId } from "../utils/activityId.js";
import { InstanceActorObject } from "../types/index.js";
import { generateActorObject } from "./actor.js";
import { parseAttachmentsForActivity } from "../utils/activitypub.js";
import { MediaItem } from "../db/schema.js";

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
  const attachments = parseAttachmentsForActivity(params.attachments || []);

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
      attributedTo: userEndpoints.actorUri,
      to: ["https://www.w3.org/ns/activitystreams#Public"],
      cc: [userEndpoints.followers],
      content: params.content,
      attachment: attachments,
    },
  };
};

export const createOutboxActivity = (params: OutboxActivity) => {
  const attachments = parseAttachmentsForActivity(params.attachments || []);

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
      attributedTo: userEndpoints.actorUri,
      to: ["https://www.w3.org/ns/activitystreams#Public"],
      cc: [userEndpoints.followers],
      content: params.content,
      attachment: attachments,
    },
  };
};

export const createNotePayload = ({
  idUri,
  createdAt,
  content,
  url,
  attachments,
}: {
  idUri: string;
  createdAt: Date;
  content: string;
  url: string;
  attachments?: MediaItem[];
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
    attachment: parseAttachmentsForActivity(attachments || []),
  };
};

export const createNoteUpdatePayload = ({
  idUri,
  createdAt,
  updatedAt,
  content,
  attachments,
}: {
  idUri: string;
  createdAt: Date;
  updatedAt: Date;
  content: string;
  attachments?: MediaItem[];
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
    object: {
      ...notePayload,
      attachment: parseAttachmentsForActivity(attachments || []),
    },
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

export const createDeleteActorActivity = () => {
  const actorUri = userEndpoints.actorUri;
  return {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: `${actorUri}/activity/delete-${Date.now()}`,
    type: "Delete",
    actor: actorUri,
    to: ["https://www.w3.org/ns/activitystreams#Public"],
    object: actorUri
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
