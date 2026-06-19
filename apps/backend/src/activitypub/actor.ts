import { ActorObject } from "../types/index.js";
import { DOMAIN } from "../config/env.js";

export const generateActorObject = ({
  domain,
  username,
  displayName,
  bio,
  publicKey,
}: ActorObject) => {
  const actorUri = `https://${domain}/actor`;

  return {
    "@context": [
      "https://www.w3.org/ns/activitystreams",
      "https://w3id.org/security/v1",
    ],
    id: actorUri,
    type: "Person",
    following: `${actorUri}/following`,
    followers: `${actorUri}/followers`,
    inbox: `${actorUri}/inbox`,
    outbox: `${actorUri}/outbox`,
    preferredUsername: username,
    name: displayName,
    summary: bio,
    url: actorUri,

    publicKey: {
      id: `${actorUri}#main-key`,
      owner: actorUri,
      publicKeyPem: publicKey,
    },
  };
};

export const userEndpoints = {
  actorUri: `https://${DOMAIN}/`,
  inbox: `https://${DOMAIN}/inbox`,
  outbox: `https://${DOMAIN}/outbox`,
  following: `https://${DOMAIN}/following`,
  followers: `https://${DOMAIN}/followers`,
  activities: `https://${DOMAIN}/activities/`,
};
