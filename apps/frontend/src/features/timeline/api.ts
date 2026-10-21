import type {
  InteractionResponse,
  MessageResponse,
  PostWithReplies,
  TimelineResponse,
  UpdatedPostResponse,
} from "@solosocius/api-types";
import { api } from "@/lib/api/axios";

export type {
  MediaItem,
  PostReply,
  PostWithReplies,
  TimelineActor,
  TimelineEvent,
  TimelineItem,
  TimelinePostObject,
  TimelineReply,
  TimelineResponse,
} from "@solosocius/api-types";

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
): Promise<InteractionResponse> => {
  const { data } = await api.post<InteractionResponse>("/interact", {
    targetPostUri,
    action: type,
  });
  return data;
};

export const undoInteraction = async (
  targetPostUri: string,
  type: "like" | "boost",
): Promise<InteractionResponse> => {
  const { data } = await api.delete<InteractionResponse>("/interact", {
    data: { targetPostUri, action: type },
  });
  return data;
};

export const deletePostApi = async (
  id: string,
): Promise<MessageResponse> => {
  const { data } = await api.delete<MessageResponse>(`/posts/${id}`);
  return data;
};

export const updatePostApi = async (
  id: string,
  content: string,
): Promise<UpdatedPostResponse> => {
  const { data } = await api.put<UpdatedPostResponse>(`/posts/${id}`, {
    content,
  });
  return data;
};

export const getPost = async (id: string): Promise<PostWithReplies> => {
  const { data } = await api.get<PostWithReplies>(`/posts/${id}`);
  return data;
};
