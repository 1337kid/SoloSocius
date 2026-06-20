import { ActorObject } from "../types/index.js";
import { DOMAIN } from "../config/env.js";

export const generateActorObject = ({
  domain,
  username,
  displayName,
  bio,
  publicKey,
}: ActorObject) => {
  return {
    "@context": [
      "https://www.w3.org/ns/activitystreams",
      "https://w3id.org/security/v1",
    ],
    id: userEndpoints.actorUri,
    type: "Person",
    following: userEndpoints.following,
    followers: userEndpoints.followers,
    inbox: userEndpoints.inbox,
    outbox: userEndpoints.outbox,
    preferredUsername: username,
    name: displayName,
    summary: bio,
    url: userEndpoints.actorUri,

    publicKey: {
      id: `${userEndpoints.actorUri}#main-key`,
      owner: userEndpoints.actorUri,
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
  activities: `https://${DOMAIN}/activities/`,
};
