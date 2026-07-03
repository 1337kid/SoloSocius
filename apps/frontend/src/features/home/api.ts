import { api } from "@/lib/api/axios";
import type { TimelineResponse } from "@/features/timeline/api";

export interface CreatePostRequest {
  content: string;
  inReplyTo?: string;
}

export async function getHomeFeed(page: number = 1): Promise<TimelineResponse> {
  const { data } = await api.get<TimelineResponse>("/feed", {
    params: { page },
  });
  return data;
}

export const createPost = async (post: CreatePostRequest) => {
  const { data } = await api.post("/posts", post);
  return data;
};

export const searchRemoteUser = async (handle: string) => {
  const { data } = await api.post("/search-user", { handle });
  return data;
};

export const followRemoteUser = async (handle: string) => {
  const { data } = await api.post("/follow", { handle });
  return data;
};
