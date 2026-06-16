import { following } from "../schema.js";
import { db } from "../index.js";
import { eq } from "drizzle-orm";

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