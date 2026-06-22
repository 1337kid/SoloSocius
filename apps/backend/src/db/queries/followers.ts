import { actors, followers } from "../schema.js";
import { eq } from "drizzle-orm";
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
