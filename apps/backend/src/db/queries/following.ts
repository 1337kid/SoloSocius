import { following, timelineEvents } from "../schema.js";
import { db } from "../index.js";
import { and, count, desc, eq, ne } from "drizzle-orm";
import {
  getCache,
  setCache,
  adjustCachedCount,
  addToCachedList,
  removeFromCachedList,
} from "../../cache/redis.js";
import { CacheKeys, TTL } from "../../cache/keys.js";

export const createFollowingUserEntry = async (
  activityId: string,
  followedActorUri: string,
) => {
  await db
    .insert(following)
    .values({
      followActivityId: activityId,
      followedActorUri,
      accepted: false,
    })
    .onConflictDoNothing();
};

export const getAllFollowingInbox = async () => {
  return await db.query.following.findMany({
    with: {
      actor: {
        columns: {
          inboxUrl: true,
          sharedInboxUrl: true,
        },
      },
    },
  });
};

export const markFollowingAsAccepted = async (actorUri: string) => {
  const updated = await db
    .update(following)
    .set({ accepted: true })
    .where(
      and(
        eq(following.followedActorUri, actorUri),
        ne(following.accepted, true),
      ),
    )
    .returning({ id: following.id });

  if (updated.length === 0) return;

  await Promise.all([
    addToCachedList(CacheKeys.followingUris, actorUri),
    adjustCachedCount(CacheKeys.localFollowingCount, 1),
  ]);
};

export const getFollowingByActivityId = async (activityId: string) => {
  return (
    await db
      .select({ followedActorUri: following.followedActorUri })
      .from(following)
      .where(eq(following.followActivityId, activityId))
      .limit(1)
  )[0];
};

export const getAllAcceptedFollowingActorUri = async () => {
  const cached = await getCache<string[]>(CacheKeys.followingUris);
  if (cached) return cached;

  const followedAccounts = await db
    .select({ uri: following.followedActorUri })
    .from(following)
    .where(eq(following.accepted, true));

  const uris = followedAccounts.map((account) => account.uri);
  await setCache(CacheKeys.followingUris, uris, TTL.followingUris);
  return uris;
};

export const checkIfLocalActorIsFollowing = async (actorUri: string) => {
  return await db.query.following.findFirst({
    where: and(
      eq(following.followedActorUri, actorUri),
      eq(following.accepted, true),
    ),
    with: {
      actor: {
        columns: {
          inboxUrl: true,
        },
      },
    },
  });
};

export const removeFollowingEntry = async (actorUri: string) => {
  const deleted = await db.transaction(async (tx) => {
    const [followingEntry] = await tx
      .delete(following)
      .where(eq(following.followedActorUri, actorUri))
      .returning();

    if (!followingEntry) return undefined;

    await tx
      .delete(timelineEvents)
      .where(eq(timelineEvents.actorUri, followingEntry.followedActorUri));

    return followingEntry;
  });

  if (!deleted) return;

  await removeFromCachedList(CacheKeys.followingUris, actorUri);

  if (deleted.accepted) {
    await adjustCachedCount(CacheKeys.localFollowingCount, -1);
  }
};

export const getUserFollowingCount = async () => {
  const [totalResult] = await db
    .select({ value: count() })
    .from(following)
    .where(eq(following.accepted, true));

  return totalResult?.value || 0;
};

export const getCachedFollowingCount = async () => {
  const cached = await getCache<number>(CacheKeys.localFollowingCount);
  if (cached !== null) return cached;

  const value = await getUserFollowingCount();
  await setCache(CacheKeys.localFollowingCount, value, TTL.localCounts);
  return value;
};

export const getAcceptedFollowingByOffset = async (
  offset: number,
  limit: number,
) => {
  return await db
    .select({ followedActorUri: following.followedActorUri })
    .from(following)
    .where(eq(following.accepted, true))
    .offset(offset)
    .limit(limit)
    .then((rows) => rows.map((row) => row.followedActorUri));
};

export const getFollowingDetailsByOffset = async (
  offset: number,
  limit: number,
) => {
  return await db.query.following.findMany({
    columns: {
      id: true,
    },
    with: {
      actor: {
        columns: {
          actorUri: true,
          displayName: true,
          username: true,
          domain: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: [desc(following.createdAt)],
    offset,
    limit,
  });
};
