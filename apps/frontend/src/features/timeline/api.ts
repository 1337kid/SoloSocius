import { api } from "@/lib/api/axios";

export interface TimelineActor {
  actorUri: string;
  username: string;
  domain: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  summary?: string | null;
  isLocal?: boolean;
}

export interface TimelinePost {
  id: string;
  type: "post" | "boost";
  actorUri: string;
  postUri: string;
  createdAt: string;
  actor: TimelineActor;
  post: {
    id: string;
    idUri: string;
    content: string;
    isLocal: boolean;
    inReplyTo: {
      url: string;
      idUri: string;
      content: string;
      actor: TimelineActor;
    } | null;
    url: string;
    createdAt: string;
    actor: TimelineActor;
  };
  interactions: {
    likes: number;
    boosts: number;
    userLiked?: boolean;
    userBoosted?: boolean;
  };
}

export interface TimelineResponse {
  page: number;
  limit: number;
  count: number;
  nextPage: number | null;
  items: TimelinePost[];
}

export async function getPublicTimeline(
  page: number = 1,
): Promise<TimelineResponse> {
  const { data } = await api.get<TimelineResponse>("/timeline", {
    params: { page },
  });
  return data;
}
