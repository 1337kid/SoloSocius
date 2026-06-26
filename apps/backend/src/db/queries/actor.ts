import { and, eq } from "drizzle-orm";
import { db } from "../index.js";
import { actors } from "../schema.js";
import { ActorObject } from "../../types/index.js";
import { userEndpoints } from "../../activitypub/actor.js";
import { DOMAIN } from "../../config/env.js";

export const setupAdminActor = async (username: string, publicKey: string) => {
  await db
    .insert(actors)
    .values({
      actorUri: userEndpoints.actorUri,
      username: username,
      domain: DOMAIN,
      displayName: "User",
      summary: "SoloSocius account",
      avatarUrl: "",
      publicKey: publicKey,
      publicKeyId: `${userEndpoints.actorUri}#main-key`,
      inboxUrl: userEndpoints.inbox,
      sharedInboxUrl: userEndpoints.inbox,
      isLocal: true,
      lastFetchedAt: new Date(),
    })
    .returning();
};

export const getActorOnThisInstance = async () => {
  return (await db.select().from(actors).where(eq(actors.isLocal, true)))[0];
};

export const checkActorOnThisInstance = async (username: string) => {
  return (
    await db
      .select()
      .from(actors)
      .where(and(eq(actors.isLocal, true), eq(actors.username, username)))
  )[0];
};

export const getActorFromDB = async (actorUri: string) => {
  return (
    await db.select().from(actors).where(eq(actors.actorUri, actorUri)).limit(1)
  )[0];
};

export const addActorToDB = async (params: ActorObject) => {
  const [actor] = await db
    .insert(actors)
    .values({
      actorUri: params.actorUri,
      username: params.username,
      domain: params.domain,
      displayName: params.displayName,
      summary: params.summary,
      avatarUrl: "",
      publicKeyId: params.publicKeyId,
      publicKey: params.publicKey,
      inboxUrl: params.inboxUrl,
      sharedInboxUrl: params.sharedInboxUrl,
      isLocal: false,
      lastFetchedAt: new Date(),
    })
    .returning();

  return actor;
};
