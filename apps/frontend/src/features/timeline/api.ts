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

export const sendInteraction = async (
  targetPostUri: string,
  type: "like" | "boost",
) => {
  console.log("sendInteraction", targetPostUri, type);
  const { data } = await api.post("/interact", { targetPostUri, type });
  return data;
};

export const undoInteraction = async (
  targetPostUri: string,
  type: "like" | "boost",
) => {
  const { data } = await api.delete("/interact", {
    data: { targetPostUri, type },
  });
  return data;
};
