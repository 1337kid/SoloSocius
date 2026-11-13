import {
  createTimelineEntry,
  getTimelineItem,
} from "../db/queries/timeline.js";
import { publishTimelineEvent } from "../services/publish-timeline.js";

export const createAndPublishTimelineEntry = async (
  actorUri: string,
  postUri: string,
  type: "post" | "boost",
) => {
  if (await getTimelineItem({ postUri, actorUri, type })) {
    return;
  }

  await createTimelineEntry({ actorUri, postUri, type });
  await publishTimelineEvent({ kind: "update", postUri, actorUri, type });
};
