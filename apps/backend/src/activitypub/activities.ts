import { userEndpoints } from "../activitypub/actor.js";
import { OutboxActivity } from "../types/index.js";
import {
  generateAcceptActivityId,
  generateProfileUpdateActivityId,
  generateRejectActivityId,
  generateRelayFollowActivityId,
} from "../utils/activityId.js";
import { InstanceActorObject } from "../types/index.js";
import { generateActorObject } from "./actor.js";
import {
  deliverActivityToFollowers,
  parseAttachmentsForActivity,
} from "../utils/activitypub.js";
import { MediaItem, actors } from "../db/schema.js";
import { ACTIVITYSTREAMS_CONTEXT, PUBLIC_COLLECTION } from "./constants.js";

export const createActivity = (
  activityId: string,
  type: string,
  object: any,
) => {
  return {
    "@context": ACTIVITYSTREAMS_CONTEXT,
    id: activityId,
    type: type,
    actor: userEndpoints.actorUri,
    object: object,
    to: [PUBLIC_COLLECTION],
  };
};

export const createRelayFollowActivity = (relayId: string) => {
  return createActivity(
    generateRelayFollowActivityId(relayId),
    "Follow",
    PUBLIC_COLLECTION,
  );
};

export const createRelayUndoFollowActivity = (relayId: string) => {
  const followActivityId = generateRelayFollowActivityId(relayId);

  return createActivity(`${followActivityId}#undo`, "Undo", followActivityId);
};

export const createProfileUpdateActivity = (params: InstanceActorObject) => {
  let object = generateActorObject(params);
  delete (object as any)["@context"];

  const activityId = generateProfileUpdateActivityId();

  return createActivity(activityId, "Update", object);
};

type LocalActorRecord = Pick<
  typeof actors.$inferSelect,
  | "username"
  | "displayName"
  | "summary"
  | "publicKey"
  | "avatarUrl"
  | "bannerUrl"
  | "manuallyApprovesFollowers"
>;

export const broadcastProfileUpdate = async (
  actor: LocalActorRecord,
  overrides: { avatarUrl?: string; bannerUrl?: string } = {},
) => {
  const activity = createProfileUpdateActivity({
    username: actor.username,
    displayName: actor.displayName || "",
    summary: actor.summary || "",
    publicKey: actor.publicKey,
    avatarUrl: overrides.avatarUrl ?? actor.avatarUrl ?? "",
    bannerUrl: overrides.bannerUrl ?? actor.bannerUrl ?? "",
    manuallyApprovesFollowers: actor.manuallyApprovesFollowers,
  });

  await deliverActivityToFollowers(activity);
};

export const createNoteActivity = (params: OutboxActivity) => {
  const attachments = parseAttachmentsForActivity(params.attachments || []);

  return {
    "@context": ACTIVITYSTREAMS_CONTEXT,
    id: `${params.idUri}/activity`,
    type: "Create",
    actor: userEndpoints.actorUri,
    to: [PUBLIC_COLLECTION],
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
      to: [PUBLIC_COLLECTION],
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
    to: [PUBLIC_COLLECTION],
    cc: [userEndpoints.followers],
    object: {
      id: params.idUri,
      type: "Note",
      summary: null,
      inReplyTo: params.inReplyTo,
      published: params.createdAt.toISOString(),
      url: params.url || `${userEndpoints.home}/posts/${params.id}`,
      attributedTo: userEndpoints.actorUri,
      to: [PUBLIC_COLLECTION],
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
    "@context": ACTIVITYSTREAMS_CONTEXT,
    id: idUri,
    type: "Note",
    published: createdAt.toISOString(),
    url: idUri,
    actor: userEndpoints.actorUri,
    attributedTo: userEndpoints.actorUri,
    to: [PUBLIC_COLLECTION],
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
    "@context": ACTIVITYSTREAMS_CONTEXT,
    id: `${idUri}/activity/update-${Date.now()}`,
    type: "Update",
    actor: userEndpoints.actorUri,
    to: [PUBLIC_COLLECTION],
    object: {
      ...notePayload,
      attachment: parseAttachmentsForActivity(attachments || []),
    },
  };
};

export const createDeleteActivity = (idUri: string) => {
  return {
    "@context": ACTIVITYSTREAMS_CONTEXT,
    id: `${idUri}/activity/delete`,
    type: "Delete",
    actor: userEndpoints.actorUri,
    to: [PUBLIC_COLLECTION],
    object: {
      id: idUri,
      type: "Tombstone",
    },
  };
};

export const createDeleteActorActivity = () => {
  const actorUri = userEndpoints.actorUri;
  return {
    "@context": ACTIVITYSTREAMS_CONTEXT,
    id: `${actorUri}/activity/delete-${Date.now()}`,
    type: "Delete",
    actor: actorUri,
    to: [PUBLIC_COLLECTION],
    object: actorUri,
  };
};

export const createInteractionActivity = (
  activityId: string,
  activityType: "Like" | "Announce",
  targetPostUri: string,
) => {
  const activity = {
    "@context": ACTIVITYSTREAMS_CONTEXT,
    id: activityId,
    type: activityType,
    actor: userEndpoints.actorUri,
    object: targetPostUri,
  };

  if (activityType === "Announce") {
    return {
      ...activity,
      to: [PUBLIC_COLLECTION],
    };
  }

  return activity;
};

export const createAcceptFollowActivity = (
  followActivityId: string,
  actorUri: string,
) => {
  return createActivity(generateAcceptActivityId(), "Accept", {
    type: "Follow",
    id: followActivityId,
    actor: actorUri,
    object: userEndpoints.actorUri,
  });
};

export const createRejectFollowActivity = (
  followActivityId: string,
  actorUri: string,
) => {
  return createActivity(generateRejectActivityId(), "Reject", {
    type: "Follow",
    id: followActivityId,
    actor: actorUri,
    object: userEndpoints.actorUri,
  });
};
