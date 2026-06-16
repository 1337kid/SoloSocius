export interface ActorObject {
  domain: string;
  username: string;
  displayName: string;
  bio: string;
  publicKey: string;
}

export interface RemotePostInput {
  actorUri: string;
  idUri: string;
  content: string;
  inReplyTo?: string | null;
  url?: string | null;
  published?: string | Date | null;
}

export interface createFollowerInupt {
  followerActorUri: string;
  inboxUrl: string;
  sharedInboxUrl: string;
}

export interface DeliverParams {
  inboxUrl: string;
  activity: any;
  privateKeyPem: string;
  keyId: string;
}
