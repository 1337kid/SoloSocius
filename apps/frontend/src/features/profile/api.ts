import { api } from "@/lib/api/axios";

export interface ProfileData {
  // banner: string;
  username: string;
  avatarUrl: string | null;
  displayName: string | null;
  summary: string | null;
  domain: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
}

export const getProfileData = async () => {
  const { data } = await api.get<ProfileData>("/profile");
  return data;
};
