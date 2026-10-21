import type { MediaItem, MessageResponse } from "./common.js";

export interface CreatePostRequest {
  content: string;
  inReplyTo?: string;
  mediaItems?: MediaItem[];
}

export interface UpdatePostRequest {
  content: string;
}

export interface PostActorSummary {
  actorUri: string;
  displayName: string | null;
  domain: string;
  username: string;
  avatarUrl: string | null;
}

export interface PostReply {
  id: string;
  idUri: string;
  content: string;
  createdAt: string;
  mediaItems: MediaItem[] | null;
  url: string | null;
  liked: boolean;
  boosted: boolean;
  actor: PostActorSummary;
}

export interface PostWithReplies {
  id: string;
  idUri: string;
  content: string;
  createdAt: string;
  inReplyTo: string | null;
  mediaItems: MediaItem[] | null;
  url: string | null;
  isLocal: boolean;
  likeCount: number;
  boostCount: number;
  replyCount: number;
  liked: boolean;
  boosted: boolean;
  actor: PostActorSummary;
  replies: PostReply[];
}

export interface CreatedPostResponse {
  id: string;
  actorUri: string;
  idUri: string;
  content: string;
  isLocal: boolean;
  inReplyTo: string | null;
  url: string | null;
  likeCount: number;
  boostCount: number;
  replyCount: number;
  mediaItems: MediaItem[] | null;
  createdAt: string;
}

export interface UpdatedPostResponse extends Omit<CreatedPostResponse, "url"> {
  url: string | null;
}

export type DeletePostResponse = MessageResponse;
