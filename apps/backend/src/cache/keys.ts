export const CacheKeys = {
  localActor: "actor:local",
  localProfile: "actor:local:profile",
  localFollowersCount: "actor:local:counts:followers",
  localFollowingCount: "actor:local:counts:following",
  localPostsCount: "actor:local:counts:posts",
  privateKey: "user:private_key",
  followingUris: "following:accepted_uris",
  actor: (uri: string) => `actor:${uri}`,
};

export const TTL = {
  localActor: 6 * 60 * 60,
  localProfile: 6 * 60 * 60,
  localCounts: 6 * 60 * 60,
  remoteActor: 30 * 60,
  followingUris: 6 * 60 * 60,
  privateKey: 48 * 60 * 60,
};