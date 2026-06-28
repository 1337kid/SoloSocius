import { api } from "@/lib/api/axios";

export interface TimelinePost {
  id: string;
  idUri: string;
  content: string;
  createdAt: string;
  actor: {
    actorUri: string;
    username: string;
    domain: string;
    displayName: string | null;
    avatarUrl: string | null;
    summary: string | null;
    isLocal: boolean;
  };
  post: {
    id: string;
    idUri: string;
    content: string;
    createdAt: string;
    url: string;
    inReplyTo: {
      url: string;
      idUri: string;
      content: string;
      actor: TimelinePost["actor"];
    } | null;
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
