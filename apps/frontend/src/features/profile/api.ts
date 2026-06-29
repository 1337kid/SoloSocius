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

export const getProfileData = async () => {
  const { data } = await api.get<ProfileData>("/profile");
  return data;
};

export const updateProfile = async (profile: Profile): Promise<ProfileData> => {
  const { data } = await api.put<ProfileData>("/profile", profile);
  return data;
};
