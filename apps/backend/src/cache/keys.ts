export const CacheKeys = {
  localActor: "actor:local",
  localProfile: "actor:local:profile",
  privateKey: "user:private_key",
  followingUris: "following:accepted_uris",
  actor: (uri: string) => `actor:${uri}`,
};

export const TTL = {
  localActor: 30 * 60,      // 30 minutes
  localProfile: 10 * 60,    // 10 minutes
  remoteActor: 30 * 60,     // 30 minutes
  followingUris: 10 * 60,   // 10 minutes
  privateKey: 24 * 60 * 60, // 24 hours (effectively permanent)
};
