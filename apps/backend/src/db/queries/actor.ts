import { and, eq, sql } from "drizzle-orm";
import { db } from "../index.js";
import { actors } from "../schema.js";
import { ActorObject } from "../../types/index.js";
import { userEndpoints } from "../../activitypub/actor.js";
import { DOMAIN } from "../../config/env.js";
import { getCache, setCache, deleteCache } from "../../cache/redis.js";
import { CacheKeys, TTL } from "../../cache/keys.js";

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
  const cached = await getCache<(typeof actors.$inferSelect)>(CacheKeys.localActor);
  if (cached) return cached;

  const actor = (await db.select().from(actors).where(eq(actors.isLocal, true)))[0];
  if (actor) await setCache(CacheKeys.localActor, actor, TTL.localActor);
  return actor;
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
  const cacheKey = CacheKeys.actor(actorUri);
  const cached = await getCache<(typeof actors.$inferSelect)>(cacheKey);
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

type LocalActorProfile = Awaited<ReturnType<typeof fetchLocalActorProfileData>>;

const fetchLocalActorProfileData = async () =>
  db.query.actors.findFirst({
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

export const getLocalActorProfileData = async () => {
  const cached = await getCache<LocalActorProfile>(CacheKeys.localProfile);
  if (cached) return cached;

  const profile = await fetchLocalActorProfileData();
  if (profile) await setCache(CacheKeys.localProfile, profile, TTL.localProfile);
  return profile;
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
  await deleteCache(CacheKeys.localActor, CacheKeys.localProfile);
  return actor;
};

export const updateLocalActorAvatar = async (avatarUrl: string) => {
  await db.update(actors).set({ avatarUrl }).where(eq(actors.isLocal, true));
  await deleteCache(CacheKeys.localActor, CacheKeys.localProfile);
};

export const updateLocalActorBanner = async (bannerUrl: string) => {
  await db.update(actors).set({ bannerUrl }).where(eq(actors.isLocal, true));
  await deleteCache(CacheKeys.localActor, CacheKeys.localProfile);
};

export const deleteLocalActor = async () => {
  await db.delete(actors).where(eq(actors.isLocal, true));

  await deleteCache(
    CacheKeys.localActor,
    CacheKeys.localProfile,
    CacheKeys.privateKey,
    CacheKeys.followingUris,
  );
};
