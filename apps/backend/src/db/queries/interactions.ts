import { interactions, posts } from "../schema.js";
import { db } from "../index.js";
import { and, eq, sql } from "drizzle-orm";
import { userEndpoints } from "../../activitypub/actor.js";

interface InteractionObject {
  type: "like" | "boost";
  activityId: string;
  postUri: string;
  actorUri: string;
}

export const addInteractionEntry = async ({
  type,
  activityId,
  actorUri,
  postUri,
}: InteractionObject) => {
  await db.transaction(async (tx) => {
    const inserted = await tx
      .insert(interactions)
      .values({
        type,
        activityId,
        actorUri,
        postUri,
      })
      .onConflictDoNothing()
      .returning();

    if (inserted.length === 0) return;

    await tx
      .update(posts)
      .set({
        [type === "like" ? "likeCount" : "boostCount"]:
          sql`${posts[type === "like" ? "likeCount" : "boostCount"]} + 1`,
      })
      .where(and(eq(posts.idUri, postUri), eq(posts.isLocal, true)));
  });
};

export const findInteractionByActivityId = async (activityId: string) => {
  return await db.query.interactions.findFirst({
    columns: {
      id: true,
      postUri: true,
      type: true,
    },
    where: eq(interactions.activityId, activityId),
  });
};

export const findInteractionByPostAndType = async (
  postUri: string,
  type: "like" | "boost",
) => {
  return await db.query.interactions.findFirst({
    columns: {
      activityId: true,
      postUri: true,
      id: true,
    },
    with: {
      post: {
        with: {
          actor: {
            columns: {
              inboxUrl: true,
            },
          },
        },
        columns: {
          idUri: true,
        },
      },
    },
    where: and(
      eq(interactions.postUri, postUri),
      eq(interactions.type, type),
      eq(interactions.actorUri, userEndpoints.actorUri),
    ),
  });
};

export const removeInteractionById = async (interactionId: string) => {
  await db.transaction(async (tx) => {
    const interaction = (
      await tx
        .delete(interactions)
        .where(eq(interactions.id, interactionId))
        .returning()
    )[0];

    if (!interaction) return;

    await tx
      .update(posts)

      .set({
        [interaction.type === "like" ? "likeCount" : "boostCount"]:
          sql`GREATEST(0, ${posts[interaction.type === "like" ? "likeCount" : "boostCount"]} - 1)`,
      })
      .where(
        and(eq(posts.idUri, interaction.postUri), eq(posts.isLocal, true)),
      );
  });
};
