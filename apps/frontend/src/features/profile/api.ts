import type {
  FollowersData,
  FollowRequestData,
  MessageResponse,
  ProfileData,
  ToggleManuallyApprovesFollowersResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  UploadedMediaResponse,
} from "@solosocius/api-types";
import { api } from "@/lib/api/axios";

export type {
  FollowersData,
  FollowRequestData,
  ProfileData,
  UpdateProfileRequest as Profile,
} from "@solosocius/api-types";

export const getProfileData = async (): Promise<ProfileData> => {
  const { data } = await api.get<ProfileData>("/profile");
  return data;
};

export const updateProfile = async (
  profile: UpdateProfileRequest,
): Promise<UpdateProfileResponse> => {
  const { data } = await api.put<UpdateProfileResponse>("/profile", profile);
  return data;
};

export const uploadProfileAvatar = async (
  file: File,
): Promise<UploadedMediaResponse> => {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<UploadedMediaResponse>(
    "/media/avatar",
    form,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return data;
};

export const uploadProfileBanner = async (
  file: File,
): Promise<UploadedMediaResponse> => {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<UploadedMediaResponse>(
    "/media/banner",
    form,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return data;
};

export const getFollowersData = async (page: number) => {
  const { data } = await api.get<FollowersData[]>(`/followers?page=${page}`);
  return {
    followers: data,
    nextPage: data.length > 0 ? page + 1 : undefined,
  };
};

export const getFollowingData = async (page: number) => {
  const { data } = await api.get<FollowersData[]>(`/following?page=${page}`);
  return {
    following: data,
    nextPage: data.length > 0 ? page + 1 : undefined,
  };
};

export const unfollowRemoteUser = async (
  actorUri: string,
): Promise<MessageResponse> => {
  const { data } = await api.delete<MessageResponse>(`/follow`, {
    data: {
      actorUri,
    },
  });

  return data;
};

export const deleteAccount = async (password: string): Promise<void> => {
  await api.delete("/account", { data: { password } });
};

export const getFollowRequestsData = async (page: number) => {
  const { data } = await api.get<FollowRequestData[]>(
    `/follow-requests?page=${page}`,
  );
  return {
    followRequests: data,
    nextPage: data.length > 0 ? page + 1 : undefined,
  };
};

export const approveFollowRequest = async (
  id: string,
): Promise<MessageResponse> => {
  const { data } = await api.post<MessageResponse>(
    `/follow-requests/${id}/approve`,
  );

  return data;
};

export const rejectFollowRequest = async (
  id: string,
): Promise<MessageResponse> => {
  const { data } = await api.delete<MessageResponse>(
    `/follow-requests/${id}`,
  );

  return data;
};

export const toggleManuallyApprovesFollowers =
  async (): Promise<ToggleManuallyApprovesFollowersResponse> => {
    const { data } = await api.post<ToggleManuallyApprovesFollowersResponse>(
      "/follow-requests/toggle",
    );

    return data;
  };
