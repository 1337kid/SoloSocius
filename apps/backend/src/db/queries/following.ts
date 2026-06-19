import { following } from "../schema.js";
import { db } from "../index.js";
import { and, eq } from "drizzle-orm";

export const createFollowingUserEntry = async (
  followingActorUri: string,
  inboxUri: string,
) => {
  await db
    .insert(following)
    .values({
      followingActorUri,
      inboxUri,
      status: "pending",
    })
    .onConflictDoNothing();
};

export const markFollowingAsAccepted = async (actorUri: string) => {
  await db
    .update(following)
    .set({ status: "accepted" })
    .where(eq(following.followingActorUri, actorUri));
};

export const isFollowRequestPending = async (actorUri: string) => {
  const [res] = await db
    .select()
    .from(following)
    .where(
      and(
        eq(following.followingActorUri, actorUri),
        eq(following.status, "pending"),
      ),
    )
    .limit(1);
  return res;
};
