import type { MessageResponse } from "./common.js";

export interface ProfileData {
  bannerUrl: string | null;
  username: string;
  avatarUrl: string | null;
  displayName: string | null;
  summary: string | null;
  domain: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  manuallyApprovesFollowers: boolean;
}

export interface UpdateProfileRequest {
  displayName: string;
  summary?: string;
}

export type UpdateProfileResponse = MessageResponse;

export interface ToggleManuallyApprovesFollowersResponse {
  manuallyApprovesFollowers: boolean;
}

export type FollowState = "none" | "requested" | "following";

export interface ExternalProfile {
  actorUri: string;
  webfinger: string;
  username: string;
  domain: string;
  displayName: string | null;
  summary: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  manuallyApprovesFollowers: boolean;
  isLocal: boolean;
  followState: FollowState;
  postsCount: number;
}

export type DeleteAccountResponse = MessageResponse;
