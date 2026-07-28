import { eq, sql } from "drizzle-orm";
import { db } from "../index.js";
import { media } from "../schema.js";

export const storeMediaRecord = async (params: {
  key: string;
  size: number;
  mimeType: string;
  type?: "post" | "avatar" | "banner";
}) => {
  const type = params.type || "post";
  return await db
    .insert(media)
    .values({ ...params, type })
    .returning();
};

export const deleteMediaRecord = async (key: string) => {
  await db.delete(media).where(eq(media.key, key));
};

export const getAvatarKey = async () => {
  return [
    ...(await db.select().from(media).where(eq(media.type, "avatar")).limit(1)),
  ][0].key;
};

export const getBannerKey = async () => {
  return [
    ...(await db.select().from(media).where(eq(media.type, "banner")).limit(1)),
  ][0].key;
};
