import { following } from "../schema.js";
import { db } from "../index.js";
import { and, eq } from "drizzle-orm";

export const createFollowingUserEntry = async (
  activityId: string,
  followedActorUri: string,
) => {
  await db
    .insert(following)
    .values({
      followActivityId: activityId,
      followedActorUri,
      status: "pending",
    })
    .onConflictDoNothing();
};

export const markFollowingAsAccepted = async (actorUri: string) => {
  await db
    .update(following)
    .set({ status: "accepted" })
    .where(eq(following.followedActorUri, actorUri));
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
  const followedAccounts = await db
    .select({ uri: following.followedActorUri })
    .from(following)
    .where(eq(following.status, "accepted"));

  return followedAccounts.map((account) => account.uri);
};

export const checkIfLocalActorIsFollowing = async (actorUri: string) => {
  const followingEntry = await db
    .select()
    .from(following)
    .where(
      and(
        eq(following.followedActorUri, actorUri),
        eq(following.status, "accepted"),
      ),
    )
    .limit(1);

  return followingEntry.length > 0;
};
