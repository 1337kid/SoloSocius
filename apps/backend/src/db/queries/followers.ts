import { followers } from "../schema.js";
import { eq } from "drizzle-orm";
import { createFollowerInupt } from "../../types/index.js";
import { db } from "../index.js";

export const createFollowerEntry = async (data: createFollowerInupt) => {
  await db.insert(followers).values(data).onConflictDoNothing();
};

export const removeFollowerEntry = async (actorId: string) => {
  await db.delete(followers).where(eq(followers.followerActorUri, actorId));
};
