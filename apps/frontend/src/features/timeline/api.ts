import { api } from "@/lib/api/axios";

export interface TimelineActor {
  actorUri?: string;
  avatarUrl: string | null;
  displayName: string | null;
  username: string;
  domain: string;
  isFollowing?: boolean;
}

export interface TimelineReply {
  idUri: string;
  url: string | null;
  content: string;

  actor: TimelineActor;
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

  actor: TimelineActor;

  inReplyTo: TimelineReply | null;
}

export interface TimelineEvent {
  createdAt: string;
  type: "post" | "boost";
}

export interface TimelineItem {
  event: TimelineEvent;
  actor: TimelineActor;
  post: TimelinePostObject;
}

export interface TimelineResponse {
  page: number;
  limit: number;
  count: number;
  nextPage: number | null;
  items: TimelineItem[];
}

export async function getPublicTimeline(
  page: number = 1,
): Promise<TimelineResponse> {
  const { data } = await api.get<TimelineResponse>("/timeline", {
    params: { page },
  });
  return data;
}
