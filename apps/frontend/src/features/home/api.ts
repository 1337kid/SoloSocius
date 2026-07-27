import { api } from "@/lib/api/axios";
import type { TimelineResponse, MediaItem } from "@/features/timeline/api";

export interface CreatePostRequest {
  content: string;
  inReplyTo?: string;
  mediaItems?: MediaItem[];
}

export interface UploadedAttachment {
  key: string;
  url: string;
  width: number;
  height: number;
  mimeType: string;
}

export const uploadAttachment = async (file: File): Promise<UploadedAttachment> => {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<UploadedAttachment>("/media/attachment", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteAttachment = async (key: string): Promise<void> => {
  await api.delete("/media/attachment", { data: { key } });
};

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

export const followRemoteUser = async (actorUri: string) => {
  const { data } = await api.post("/follow", { actorUri });
  return data;
};
