import { interactions } from "../schema.js";
import { db } from "../index.js";
import { and, eq } from "drizzle-orm";
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
  await db.insert(interactions).values({
    type,
    activityId,
    actorUri,
    postUri,
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
  await db.delete(interactions).where(eq(interactions.id, interactionId));
};
