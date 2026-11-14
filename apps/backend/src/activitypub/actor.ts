import { InstanceActorObject } from "../types/index.js";
import { DOMAIN } from "../config/env.js";
import {
  ACTIVITYSTREAMS_CONTEXT,
  SECURITY_CONTEXT,
  SYSTEM_ACTOR_USERNAME,
} from "./constants.js";

export const generateActorObject = ({
  username,
  displayName,
  summary,
  publicKey,
  avatarUrl,
  bannerUrl,
  manuallyApprovesFollowers,
}: InstanceActorObject) => {
  return {
    "@context": [ACTIVITYSTREAMS_CONTEXT, SECURITY_CONTEXT],
    id: userEndpoints.actorUri,
    type: "Person",
    following: userEndpoints.following,
    followers: userEndpoints.followers,
    inbox: userEndpoints.inbox,
    outbox: userEndpoints.outbox,
    preferredUsername: username,
    name: displayName,
    summary: summary,
    url: userEndpoints.actorUri,
    manuallyApprovesFollowers: manuallyApprovesFollowers,

    publicKey: {
      id: `${userEndpoints.actorUri}#main-key`,
      owner: userEndpoints.actorUri,
      publicKeyPem: publicKey,
    },

    icon: {
      type: "Image",
      mediaType: "image/webp",
      url: avatarUrl || "",
    },
    image: {
      type: "Image",
      mediaType: "image/webp",
      url: bannerUrl || "",
    },
  };
};

export const generateSystemActorObject = (publicKey: string) => {
  return {
    "@context": [ACTIVITYSTREAMS_CONTEXT, SECURITY_CONTEXT],
    id: systemUserEndpoints.actorUri,
    type: "Application",

    preferredUsername: DOMAIN,
    name: "SoloSocius Server",
    inbox: systemUserEndpoints.inbox,
    outbox: systemUserEndpoints.outbox,

    publicKey: {
      id: `${systemUserEndpoints.actorUri}#main-key`,
      owner: systemUserEndpoints.actorUri,
      publicKeyPem: publicKey,
    },
  };
};

export const userEndpoints = {
  home: `https://${DOMAIN}`,
  actorUri: `https://${DOMAIN}/actor`,
  inbox: `https://${DOMAIN}/inbox`,
  outbox: `https://${DOMAIN}/outbox`,
  following: `https://${DOMAIN}/following`,
  followers: `https://${DOMAIN}/followers`,
  activities: `https://${DOMAIN}/activities`,
};

export const systemUserEndpoints = {
  actorUri: `https://${DOMAIN}/actor/${SYSTEM_ACTOR_USERNAME}`,
  inbox: `https://${DOMAIN}/inbox`,
  outbox: `https://${DOMAIN}/actor/${SYSTEM_ACTOR_USERNAME}/outbox`,
};
