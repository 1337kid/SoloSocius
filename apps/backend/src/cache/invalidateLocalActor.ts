import { deleteCache } from "./redis.js";
import { CacheKeys } from "./keys.js";

type LocalActorCacheScope =
  | "profile"
  | "followers"
  | "following"
  | "posts"
  | "all";

const scopeKeys: Record<LocalActorCacheScope, string[]> = {
  profile: [CacheKeys.localActor, CacheKeys.localProfile],
  followers: [CacheKeys.localFollowersCount],
  following: [CacheKeys.localFollowingCount],
  posts: [CacheKeys.localPostsCount],
  all: [
    CacheKeys.localActor,
    CacheKeys.localProfile,
    CacheKeys.localFollowersCount,
    CacheKeys.localFollowingCount,
    CacheKeys.localPostsCount,
    CacheKeys.privateKey,
    CacheKeys.followingUris,
  ],
};

export const invalidateLocalActorCache = async (
  ...scopes: LocalActorCacheScope[]
): Promise<void> => {
  const keys = [...new Set(scopes.flatMap((scope) => scopeKeys[scope]))];
  if (keys.length > 0) await deleteCache(...keys);
};
