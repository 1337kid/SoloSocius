import type { TimelineItem } from "@solosocius/api-types";
import type { getProfileTimeline } from "../db/queries/timeline.js";

export type TimelineRow = Awaited<ReturnType<typeof getProfileTimeline>>[number];

export function serializeTimelineItem(item: TimelineRow): TimelineItem {
  const createdAt = (value: string | Date) =>
    value instanceof Date ? value.toISOString() : value;

  return {
    event: {
      createdAt: createdAt(item.event.createdAt),
      type: item.event.type === "boost" ? "boost" : "post",
    },
    actor: item.actor,
    post: {
      ...item.post,
      createdAt: createdAt(item.post.createdAt),
      actor: item.postActor,
      inReplyTo: item.parentPost
        ? { ...item.parentPost, actor: item.parentActor }
        : null,
    },
  };
}

export function serializeTimelineItems(feedItems: TimelineRow[]): TimelineItem[] {
  return feedItems.map(serializeTimelineItem);
}
