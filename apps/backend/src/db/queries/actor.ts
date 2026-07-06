import { and, eq, sql } from "drizzle-orm";
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
      bannerUrl: "",
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
      avatarUrl: params.avatarUrl,
      bannerUrl: params.bannerUrl,
      publicKeyId: params.publicKeyId,
      publicKey: params.publicKey,
      inboxUrl: params.inboxUrl,
      sharedInboxUrl: params.sharedInboxUrl,
      isLocal: false,
      lastFetchedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [actors.actorUri],
      set: {
        ...params,
      },
    })
    .returning();

  return actor;
};

export const getLocalActorProfileData = async () => {
  return await db.query.actors.findFirst({
    where: eq(actors.isLocal, true),
    columns: {
      username: true,
      displayName: true,
      summary: true,
      domain: true,
      avatarUrl: true,
      bannerUrl: true,
    },
    extras: {
      followersCount: sql<number>`(SELECT count(*) FROM followers)`.as(
        "followers_count",
      ),
      followingCount: sql<number>`(SELECT count(*) FROM following)`.as(
        "following_count",
      ),
      postsCount:
        sql<number>`(SELECT count(*) FROM posts WHERE posts.actor_uri = ${userEndpoints.actorUri})`.as(
          "posts_count",
        ),
    },
  });
};

export const updateLocalActorProfileData = async (params: {
  displayName: string;
  summary: string;
}) => {
  const [actor] = await db
    .update(actors)
    .set(params)
    .where(eq(actors.isLocal, true))
    .returning();
  return actor;
};
