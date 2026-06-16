import { ActorObject } from "../types/index.js";

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
