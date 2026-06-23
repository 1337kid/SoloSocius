import { interactions } from "../schema.js";
import { db } from "../index.js";

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
