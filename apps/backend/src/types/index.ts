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
  bannerUrl: string;
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
  incomingFollowActivityId: string;
}

export interface DeliverParams {
  inboxUrl: string;
  activity: any;
}

export interface NotificationType {
  type: string;
  actorUri: string;
  targetPostUri: string;
  activityId: string;
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

export type ActivityObject =
  | string
  | {
      id: string;
      type?: string;
      [key: string]: any;
    };

export interface InboxActivity {
  id: string;
  actor: string;
  type:
    | "Follow"
    | "Accept"
    | "Delete"
    | "Create"
    | "Like"
    | "Undo"
    | "Announce";
  object: ActivityObject;
}
