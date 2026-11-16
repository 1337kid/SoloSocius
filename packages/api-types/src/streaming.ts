export const TIMELINE_STREAMS = ["user", "public", "public:local"] as const;

export const ACCOUNT_STREAM_PREFIX = "account:" as const;

export type TimelineStream =
  | (typeof TIMELINE_STREAMS)[number]
  | `${typeof ACCOUNT_STREAM_PREFIX}${string}`;

export function accountTimelineStream(actorUri: string): TimelineStream {
  return `${ACCOUNT_STREAM_PREFIX}${actorUri}`;
}

export function isTimelineStream(value: string): value is TimelineStream {
  if ((TIMELINE_STREAMS as readonly string[]).includes(value)) return true;
  return (
    value.startsWith(ACCOUNT_STREAM_PREFIX) &&
    value.length > ACCOUNT_STREAM_PREFIX.length
  );
}

export type TimelineStreamEvent = "update" | "status.update" | "delete";

export interface TimelineSubscribeFrame {
  type: "subscribe";
  stream: TimelineStream;
}

export interface TimelineUnsubscribeFrame {
  type: "unsubscribe";
  stream: TimelineStream;
}

export type TimelineClientFrame =
  | TimelineSubscribeFrame
  | TimelineUnsubscribeFrame;

export interface TimelineDeletePayload {
  postId: string;
  eventType: "post" | "boost";
  actorUri: string;
}

export interface TimelineServerFrame {
  stream: TimelineStream[];
  event: TimelineStreamEvent;
  payload: string;
}

export interface TimelineStreamErrorFrame {
  error: string;
}
