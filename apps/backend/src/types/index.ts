export interface InstanceActorObject {
  username: string;
  displayName: string;
  summary: string;
  publicKey: string;
}

export interface ActorObject {
  actorUri: string;
  username: string;
  domain: string;
  displayName: string;
  summary: string;
  publicKeyId: string;
  avatarUrl: string;
  publicKey: string;
  inboxUrl: string;
  sharedInboxUrl: string;
}

export interface RemotePostInput {
  actorUri: string;
  idUri: string;
  content: string;
  inReplyTo?: string | null;
  url?: string | null;
  published?: string | Date | null;
}

export interface CreateFollowerInupt {
  followerActorUri: string;
  inboxUrl: string;
  sharedInboxUrl: string;
}

export interface DeliverParams {
  inboxUrl: string;
  activity: any;
}

export interface NotificationType {
  type: string;
  actorId: string;
  targetPostUri: string;
  linkedNotificationUri: string;
}

export interface OrderedCollection {
  totalItems: number;
  first: string;
  last: string;
}

export interface OutboxActivity {
  id: string;
  idUri: string;
  createdAt: Date;
  inReplyTo: string | null;
  content: string;
  url: string | null;
}
