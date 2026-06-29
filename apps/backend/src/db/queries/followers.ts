import { actors, followers } from "../schema.js";
import { count, desc, eq } from "drizzle-orm";
import { CreateFollowerInupt } from "../../types/index.js";
import { db } from "../index.js";

export const createFollowerEntry = async (data: CreateFollowerInupt) => {
  await db.insert(followers).values(data).onConflictDoNothing();
};

export const removeFollowerEntry = async (actorId: string) => {
  await db.delete(followers).where(eq(followers.followerActorUri, actorId));
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
      .where(eq(followers.followerActorUri, activityId))
      .limit(1)
  )[0];
};

export const getUserFollowersCount = async () => {
  const [totalResult] = await db.select({ value: count() }).from(followers);

  return totalResult?.value || 0;
};

export const getFollowersByOffset = async (offset: number, limit: number) => {
  return await db
    .select({ followerActorUri: followers.followerActorUri })
    .from(followers)
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
    orderBy: [desc(followers.createdAt)],
    offset,
    limit,
  });
};
