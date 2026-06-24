import { db } from "../index.js";
import { interactions, timelineEvents, notifications } from "../schema.js";
import { and, eq } from "drizzle-orm";

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
      .delete(notifications)
      .where(eq(notifications.activityId, activityId));
  });
};
