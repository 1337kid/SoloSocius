import { and, eq, sql } from "drizzle-orm";
import { db } from "../index.js";
import { actors } from "../schema.js";
import { ActorObject } from "../../types/index.js";
import { userEndpoints, systemUserEndpoints } from "../../activitypub/actor.js";
import { DOMAIN } from "../../config/env.js";
import { getCache, setCache, deleteCache } from "../../cache/redis.js";
import { CacheKeys, TTL } from "../../cache/keys.js";
import { invalidateLocalActorCache } from "../../cache/invalidateLocalActor.js";
import { getCachedFollowersCount } from "./followers.js";
import { getCachedFollowingCount } from "./following.js";
import { getCachedLocalPostsCount } from "./posts.js";

export const setupAdminActor = async (username: string, publicKey: string) => {
  const endpoints = username === "system" ? systemUserEndpoints : userEndpoints;

  await db
    .insert(actors)
    .values({
      actorUri: endpoints.actorUri,
      username: username,
      domain: DOMAIN,
      displayName: "User",
      summary: "SoloSocius account",
      avatarUrl: "",
      bannerUrl: "",
      publicKey: publicKey,
      publicKeyId: `${endpoints.actorUri}#main-key`,
      inboxUrl: endpoints.inbox,
      sharedInboxUrl: endpoints.inbox,
      isLocal: true,
      lastFetchedAt: new Date(),
    })
    .returning();
};

export const getActorOnThisInstance = async (
  type: "local" | "system" = "local",
) => {
  const endpoints = type === "local" ? userEndpoints : systemUserEndpoints;
  const cacheKey =
    type === "local" ? CacheKeys.localActor : CacheKeys.systemActor;
  const ttl = type === "local" ? TTL.localActor : TTL.systemActor;

  const cached = await getCache<typeof actors.$inferSelect>(cacheKey);
  if (cached) return cached;

  const actor = (
    await db
      .select()
      .from(actors)
      .where(eq(actors.actorUri, endpoints.actorUri))
  )[0];
  if (actor) await setCache(cacheKey, actor, ttl);
  return actor;
};

export const checkActorOnThisInstance = async (username: string) => {
  return (
    await db
      .select({ username: actors.username })
      .from(actors)
      .where(and(eq(actors.isLocal, true), eq(actors.username, username)))
  )[0];
};

export const getActorFromDB = async (actorUri: string) => {
  const cacheKey = CacheKeys.actor(actorUri);
  const cached = await getCache<typeof actors.$inferSelect>(cacheKey);
  if (cached) return cached;

  const actor = (
    await db.select().from(actors).where(eq(actors.actorUri, actorUri)).limit(1)
  )[0];
  if (actor) await setCache(cacheKey, actor, TTL.remoteActor);
  return actor;
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
      manuallyApprovesFollowers: params.manuallyApprovesFollowers,
      lastFetchedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [actors.actorUri],
      set: {
        ...params,
      },
    })
    .returning();

  await deleteCache(CacheKeys.actor(params.actorUri));
  return actor;
};

type LocalActorIdentity = {
  username: string;
  displayName: string | null;
  summary: string | null;
  domain: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  manuallyApprovesFollowers: boolean;
};

const getLocalActorIdentity = async (): Promise<
  LocalActorIdentity | undefined
> => {
  const cached = await getCache<LocalActorIdentity>(CacheKeys.localProfile);
  if (cached) return cached;

  const profile = await db.query.actors.findFirst({
    where: eq(actors.actorUri, userEndpoints.actorUri),
    columns: {
      username: true,
      displayName: true,
      summary: true,
      domain: true,
      avatarUrl: true,
      bannerUrl: true,
      manuallyApprovesFollowers: true,
    },
  });

  if (profile) {
    await setCache(CacheKeys.localProfile, profile, TTL.localProfile);
  }
  return profile;
};

export const getLocalActorProfileData = async () => {
  const [profile, followersCount, followingCount, postsCount] =
    await Promise.all([
      getLocalActorIdentity(),
      getCachedFollowersCount(),
      getCachedFollowingCount(),
      getCachedLocalPostsCount(),
    ]);

  if (!profile) return undefined;

  return {
    ...profile,
    followersCount,
    followingCount,
    postsCount,
  };
};

export const updateLocalActorProfileData = async (params: {
  displayName: string;
  summary: string;
}) => {
  const [actor] = await db
    .update(actors)
    .set(params)
    .where(eq(actors.actorUri, userEndpoints.actorUri))
    .returning();
  await invalidateLocalActorCache("profile");
  return actor;
};

export const setLocalActorManuallyApprovesFollowers = async () => {
  const [actor] = await db
    .update(actors)
    .set({ manuallyApprovesFollowers: sql`not manually_approves_followers` })
    .where(eq(actors.actorUri, userEndpoints.actorUri))
    .returning();
  await invalidateLocalActorCache("profile");
  return actor;
};

export const isManuallyApprovingFollowers = async () => {
  const actor = await getActorOnThisInstance();
  if (!actor) return false;
  return actor.manuallyApprovesFollowers;
};

export const updateLocalActorAvatar = async (avatarUrl: string) => {
  await db
    .update(actors)
    .set({ avatarUrl })
    .where(eq(actors.actorUri, userEndpoints.actorUri));
  await invalidateLocalActorCache("profile");
};

export const updateLocalActorBanner = async (bannerUrl: string) => {
  await db
    .update(actors)
    .set({ bannerUrl })
    .where(eq(actors.actorUri, userEndpoints.actorUri));
  await invalidateLocalActorCache("profile");
};

export const deleteLocalActor = async () => {
  await db.delete(actors).where(eq(actors.actorUri, userEndpoints.actorUri));
  await invalidateLocalActorCache("all");
};

export const findRelayByActorUri = async (actorUri: string) => {
  const [relay] = await db
    .select({
      type: actors.type,
    })
    .from(actors)
    .where(and(eq(actors.actorUri, actorUri), eq(actors.type, "relay")))
    .limit(1);

  return relay?.type === "relay";
};
