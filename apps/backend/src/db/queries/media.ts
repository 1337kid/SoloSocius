import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { media } from "../schema.js";

export const storeMediaRecord = async (params: {
  key: string;
  size: number;
  mimeType: string;
}) => {
  const [record] = await db
    .insert(media)
    .values(params)
    .onConflictDoUpdate({
      target: media.key,
      set: { size: params.size, mimeType: params.mimeType },
    })
    .returning();
  return record;
};

export const deleteMediaRecord = async (key: string) => {
  await db.delete(media).where(eq(media.key, key));
};
