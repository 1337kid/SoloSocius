import { api } from "@/lib/api/axios";

export interface ProfileData {
  bannerUrl: string | null;
  username: string;
  avatarUrl: string | null;
  displayName: string | null;
  summary: string | null;
  domain: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
}

export interface Profile {
  displayName: string;
}

export interface FollowersData {
  id: string;
  actor: {
    actorUri: string;
    displayName: string;
    username: string;
    domain: string;
    avatarUrl: string;
  };
}

export const getProfileData = async () => {
  const { data } = await api.get<ProfileData>("/profile");
  return data;
};

export const updateProfile = async (profile: Profile): Promise<ProfileData> => {
  const { data } = await api.put<ProfileData>("/profile", profile);
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
): Promise<{ message: string }> => {
  const { data } = await api.delete(`/follow`, {
    data: {
      actorUri,
    },
  });

  if (data.error) {
    throw new Error(data.error);
  }
  return data;
};
