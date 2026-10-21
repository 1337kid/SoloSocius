import type { ActionResponse, MessageResponse } from "./common.js";
import type { TimelineActor } from "./timeline.js";

export interface SearchUserRequest {
  handle: string;
}

export type SearchUserResponse = TimelineActor & {
  actorUri: string;
  isFollowing: boolean;
};

export interface FollowRequest {
  actorUri: string;
}

export type FollowResponse = ActionResponse;

export type UnfollowResponse = MessageResponse;

export interface RelationActorSummary {
  actorUri: string;
  displayName: string | null;
  username: string;
  domain: string;
  avatarUrl: string | null;
}

export interface FollowersData {
  id: string;
  actor: RelationActorSummary;
}

export interface FollowRequestData {
  id: string;
  accepted: boolean;
  actor: RelationActorSummary;
}

export type ApproveFollowRequestResponse = MessageResponse;
export type RejectFollowRequestResponse = MessageResponse;

export interface InteractionRequest {
  action: "like" | "boost";
  targetPostUri: string;
}

export type InteractionResponse = ActionResponse;
