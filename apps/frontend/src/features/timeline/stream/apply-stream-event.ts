import type {
  TimelineDeletePayload,
  TimelineItem,
  TimelineResponse,
  TimelineStreamEvent,
} from "@solosocius/api-types";

export interface TimelineCache {
  pages: TimelineResponse[];
  pageParams: unknown[];
}

export type AppliedTimelineFrame =
  | { event: "update"; payload: TimelineItem }
  | { event: "status.update"; payload: TimelineItem }
  | { event: "delete"; payload: TimelineDeletePayload };

export function timelineItemKey(entry: TimelineItem) {
  const createdAt =
    entry.event.createdAt instanceof Date
      ? entry.event.createdAt.toISOString()
      : entry.event.createdAt;
  const actor =
    entry.actor.actorUri ?? `${entry.actor.username}@${entry.actor.domain}`;
  return `${entry.event.type}:${actor}:${entry.post.id}:${createdAt}`;
}

function sameRow(left: TimelineItem, right: TimelineItem) {
  return timelineItemKey(left) === timelineItemKey(right);
}

export function uniqueTimelineItems(items: TimelineItem[]) {
  const seen = new Set<string>();
  return items.filter((entry) => {
    const key = timelineItemKey(entry);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mapPages(
  data: TimelineCache,
  mapItems: (items: TimelineItem[]) => TimelineItem[],
): TimelineCache {
  return {
    ...data,
    pages: data.pages.map((page) => {
      const items = mapItems(page.items);
      return {
        ...page,
        count: items.length,
        items,
      };
    }),
  };
}

export function applyStreamEvent<T extends TimelineCache>(
  data: T | undefined,
  frame: AppliedTimelineFrame,
): T | undefined {
  if (!data || data.pages.length === 0) return data;

  if (frame.event === "update") {
    const firstPage = data.pages[0];
    const alreadyLoaded = data.pages.some((page) =>
      page.items.some((entry) => sameRow(entry, frame.payload)),
    );
    if (alreadyLoaded) return data;

    const items = [frame.payload, ...firstPage.items];
    return {
      ...data,
      pages: [
        { ...firstPage, items, count: items.length },
        ...data.pages.slice(1),
      ],
    };
  }

  if (frame.event === "status.update") {
    return mapPages(data, (items) =>
      items.map((entry) =>
        entry.post.id === frame.payload.post.id
          ? { ...entry, post: frame.payload.post }
          : entry,
      ),
    ) as T;
  }

  const { postId, eventType, actorUri } = frame.payload;
  return mapPages(data, (items) =>
    items.filter((entry) => {
      if (entry.post.id !== postId) return true;
      if (eventType === "post") return false;
      return !(entry.event.type === "boost" && entry.actor.actorUri === actorUri);
    }),
  ) as T;
}

export function parseServerFrame(raw: string):
  | (AppliedTimelineFrame & { stream: string[] })
  | { error: string }
  | null {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!value || typeof value !== "object") return null;
  const frame = value as { error?: unknown; event?: unknown; payload?: unknown; stream?: unknown };
  if (typeof frame.error === "string") return { error: frame.error };
  if (frame.event !== "update" && frame.event !== "status.update" && frame.event !== "delete") {
    return null;
  }
  if (typeof frame.payload !== "string" || !Array.isArray(frame.stream)) return null;

  try {
    const payload = JSON.parse(frame.payload) as TimelineItem | TimelineDeletePayload;
    return {
      stream: frame.stream.filter((entry): entry is string => typeof entry === "string"),
      event: frame.event as TimelineStreamEvent,
      payload,
    } as AppliedTimelineFrame & { stream: string[] };
  } catch {
    return null;
  }
}
