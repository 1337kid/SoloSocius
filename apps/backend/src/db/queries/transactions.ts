import { userEndpoints } from "../../activitypub/actor.js";
import { db } from "../index.js";
import {
  interactions,
  timelineEvents,
  notifications,
  posts,
} from "../schema.js";
import { and, sql, eq } from "drizzle-orm";

export const removeBoostByActivityId = async (activityId: string) => {
  await db.transaction(async (tx) => {
    const interaction = (
      await tx
        .delete(interactions)
        .where(eq(interactions.activityId, activityId))
        .returning()
    )[0];

    if (!interaction) return;

    await tx
      .delete(timelineEvents)
      .where(
        and(
          eq(timelineEvents.actorUri, interaction.actorUri),
          eq(timelineEvents.postUri, interaction.postUri),
        ),
      );

    await tx
      .update(posts)
      .set({
        boostCount: sql`GREATEST(0, ${posts.boostCount} - 1)`,
      })
      .where(
        and(eq(posts.idUri, interaction.postUri), eq(posts.isLocal, true)),
      );

    await tx
      .delete(notifications)
      .where(eq(notifications.activityId, activityId));
  });
};
