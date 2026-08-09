import { api } from "@/lib/api/axios";

export interface MediaItem {
  url: string;
  mimeType: string;
}

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
  mediaItems: MediaItem[] | [];

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

export interface PostReply {
  id: string;
  idUri: string;
  content: string;
  createdAt: string;
  mediaItems: MediaItem[];
  url: string;
  liked: boolean;
  boosted: boolean;
  actor: {
    actorUri: string;
    displayName: string;
    domain: string;
    username: string;
    avatarUrl: string;
  };
}

export interface PostWithReplies {
  id: string;
  idUri: string;
  content: string;
  createdAt: string;
  inReplyTo: string | null;
  mediaItems: MediaItem[];
  url: string;
  isLocal: boolean;
  likeCount: number;
  boostCount: number;
  replyCount: number;
  liked: boolean;
  boosted: boolean;
  actor: {
    actorUri: string;
    displayName: string;
    domain: string;
    username: string;
    avatarUrl: string;
  };
  replies: PostReply[];
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
  const { data } = await api.post("/interact", { targetPostUri, action: type });
  return data;
};

export const undoInteraction = async (
  targetPostUri: string,
  type: "like" | "boost",
) => {
  const { data } = await api.delete("/interact", {
    data: { targetPostUri, action: type },
  });
  return data;
};

export const deletePostApi = async (id: string) => {
  const { data } = await api.delete(`/posts/${id}`);
  return data;
};

export const updatePostApi = async (id: string, content: string) => {
  const { data } = await api.put(`/posts/${id}`, { content });
  return data;
};

export const getPost = async (id: string): Promise<PostWithReplies> => {
  const { data } = await api.get<PostWithReplies>(`/posts/${id}`);
  return data;
};
