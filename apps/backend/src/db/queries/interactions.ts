import { interactions } from "../schema.js";
import { db } from "../index.js";
import { eq } from "drizzle-orm";

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
