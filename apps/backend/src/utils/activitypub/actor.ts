import { addActorToDB, getActorFromDB } from "../../db/queries/actor.js";
import { remoteFetch } from "./fetch.js";

export const remoteActorLookup = async (actorUri: string) => {
  const actor = await getActorFromDB(actorUri);
  if (actor) return actor;

  const remoteActor = await remoteFetch(actorUri);

  if (!remoteActor.ok)
    throw new Error("Could not discover target remote profile path.");

  const data = await remoteActor.json();
  const newActor = await addActorToDB({
    actorUri: actorUri,
    username: data.preferredUsername,
    domain: new URL(actorUri).hostname,
    displayName: data.name,
    summary: data.summary || data.bio,
    avatarUrl: data.icon?.url ?? "",
    bannerUrl: data.image?.url ?? "",
    publicKeyId: data.publicKey?.id,
    publicKey: data.publicKey?.publicKeyPem,
    inboxUrl: data.inbox,
    sharedInboxUrl: data.endpoints?.sharedInbox || data.inbox,
    manuallyApprovesFollowers: data.manuallyApprovesFollowers || false,
  });

  return newActor;
};
