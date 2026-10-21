import type {
  CreatePostRequest,
  CreatedPostResponse,
  FollowResponse,
  SearchUserResponse,
  TimelineResponse,
  UploadedMediaResponse,
} from "@solosocius/api-types";
import { api } from "@/lib/api/axios";

export type {
  CreatePostRequest,
  UploadedMediaResponse as UploadedAttachment,
} from "@solosocius/api-types";

export const uploadAttachment = async (
  file: File,
): Promise<UploadedMediaResponse> => {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<UploadedMediaResponse>(
    "/media/attachment",
    form,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
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

export const createPost = async (
  post: CreatePostRequest,
): Promise<CreatedPostResponse> => {
  const { data } = await api.post<CreatedPostResponse>("/posts", post);
  return data;
};

export const searchRemoteUser = async (
  handle: string,
): Promise<SearchUserResponse> => {
  const { data } = await api.post<SearchUserResponse>("/search-user", {
    handle,
  });
  return data;
};

export const followRemoteUser = async (
  actorUri: string,
): Promise<FollowResponse> => {
  const { data } = await api.post<FollowResponse>("/follow", { actorUri });
  return data;
};
