import { followers } from "../schema.js";
import { and, count, desc, eq } from "drizzle-orm";
import { CreateFollowerInupt } from "../../types/index.js";
import { db } from "../index.js";
import { getCache, setCache, adjustCachedCount } from "../../cache/redis.js";
import { CacheKeys, TTL } from "../../cache/keys.js";

export const createFollowerEntry = async (data: CreateFollowerInupt) => {
  const inserted = await db
    .insert(followers)
    .values(data)
    .onConflictDoNothing()
    .returning({ id: followers.id });

  if (inserted.length > 0 && data.accepted) {
    await adjustCachedCount(CacheKeys.localFollowersCount, 1);
  }
};

export const removeFollowerEntry = async (actorId: string) => {
  const deleted = await db
    .delete(followers)
    .where(eq(followers.followerActorUri, actorId))
    .returning({ id: followers.id });

  if (deleted.length > 0) {
    await adjustCachedCount(CacheKeys.localFollowersCount, -1);
  }
};

export const getAllFollowers = async () => {
  return await db.select().from(followers);
};

export const getAllFollowersInbox = async () => {
  return await db.query.followers.findMany({
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

export const getFollowerByActivityId = async (activityId: string) => {
  return (
    await db
      .select({ actorUri: followers.followerActorUri })
      .from(followers)
      .where(eq(followers.incomingFollowActivityId, activityId))
      .limit(1)
  )[0];
};

export const getFollowerByActorUri = async (actorUri: string) => {
  return (
    await db
      .select({ actorUri: followers.followerActorUri })
      .from(followers)
      .where(eq(followers.followerActorUri, actorUri))
      .limit(1)
  )[0];
};

export const getUserFollowersCount = async () => {
  const [totalResult] = await db
    .select({ value: count() })
    .from(followers)
    .where(eq(followers.accepted, true));

  return totalResult?.value || 0;
};

export const getCachedFollowersCount = async () => {
  const cached = await getCache<number>(CacheKeys.localFollowersCount);
  if (cached !== null) return cached;

  const value = await getUserFollowersCount();
  await setCache(CacheKeys.localFollowersCount, value, TTL.localCounts);
  return value;
};

export const getFollowersByOffset = async (offset: number, limit: number) => {
  return await db
    .select({ followerActorUri: followers.followerActorUri })
    .from(followers)
    .where(eq(followers.accepted, true))
    .offset(offset)
    .limit(limit)
    .then((rows) => rows.map((row) => row.followerActorUri));
};

export const getFollowersDetailsByOffset = async (
  offset: number,
  limit: number,
) => {
  return await db.query.followers.findMany({
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
    where: eq(followers.accepted, true),
    orderBy: [desc(followers.createdAt)],
    offset,
    limit,
  });
};

export const getFollowRequestsByOffset = async (
  offset: number,
  limit: number,
) => {
  return await db.query.followers.findMany({
    columns: {
      id: true,
      accepted: true,
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
    where: eq(followers.accepted, false),
    orderBy: [desc(followers.createdAt)],
    offset,
    limit,
  });
};

export const approveFollowRequest = async (id: string) => {
  const [followRequest] = await db
    .update(followers)
    .set({ accepted: true })
    .where(and(eq(followers.id, id), eq(followers.accepted, false)))
    .returning();

  if (!followRequest) return;

  await adjustCachedCount(CacheKeys.localFollowersCount, 1);

  return await db.query.followers.findFirst({
    columns: {
      id: true,
      incomingFollowActivityId: true,
    },
    where: and(eq(followers.id, id), eq(followers.accepted, true)),
    with: {
      actor: {
        columns: { inboxUrl: true, actorUri: true },
      },
    },
  });
};

export const getFollowerById = async (id: string) => {
  return await db.query.followers.findFirst({
    columns: {
      id: true,
      incomingFollowActivityId: true,
    },
    where: eq(followers.id, id),
    with: {
      actor: {
        columns: { inboxUrl: true, actorUri: true },
      },
    },
  });
};
