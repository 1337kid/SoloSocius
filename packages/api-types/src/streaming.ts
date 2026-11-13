export const TIMELINE_STREAMS = ["user", "public", "public:local"] as const;

export type TimelineStream = (typeof TIMELINE_STREAMS)[number];

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
