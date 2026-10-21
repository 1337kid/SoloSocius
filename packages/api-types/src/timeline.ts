import type { MediaItem } from "./common.js";

export interface TimelineActorSnippet {
  avatarUrl: string | null;
  displayName: string | null;
  username: string;
  domain: string;
}

export interface TimelinePostActor extends TimelineActorSnippet {
  actorUri: string;
}

export interface TimelineActor extends TimelineActorSnippet {
  actorUri?: string;
  isFollowing?: boolean;
}

export interface TimelineReply {
  idUri: string;
  url: string | null;
  content: string;
  actor: TimelineActorSnippet | null;
}

export interface TimelinePostObject {
  id: string;
  idUri: string;
  url: string | null;
  content: string;
  createdAt: string;
  likeCount: number;
  boostCount: number;
  replyCount: number;
  liked: boolean;
  boosted: boolean;
  actor: TimelinePostActor;
  mediaItems: MediaItem[] | null;
  inReplyTo: TimelineReply | null;
}

export interface TimelineEvent {
  createdAt: string | Date;
  type: "post" | "boost";
}

export interface TimelineItem {
  event: TimelineEvent;
  actor: TimelineActorSnippet;
  post: TimelinePostObject;
}

export interface TimelineResponse {
  page: number;
  limit: number;
  count: number;
  nextPage: number | null;
  items: TimelineItem[];
}
