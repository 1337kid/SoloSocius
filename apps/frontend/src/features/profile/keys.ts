export const profileQueryKeys = {
  public: ["publicProfile"] as const,
  followers: ["followers"] as const,
  followersLists: () => [...profileQueryKeys.followers, "list"] as const,
  followersList: (page: number) =>
    [...profileQueryKeys.followers, page] as const,
  following: ["following"] as const,
  followingLists: () => [...profileQueryKeys.following, "list"] as const,
  followingList: (page: number) =>
    [...profileQueryKeys.following, page] as const,
};
