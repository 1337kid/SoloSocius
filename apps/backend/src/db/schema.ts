import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  passwordHash: text("password_hash").notNull(),
  privateKey: text("private_key").notNull(),
  publicKey: text("public_key").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: uuid().defaultRandom().primaryKey(),
  actorId: text("actor_id").notNull(), // URI pointing to the author profile
  idUri: text("id_uri").notNull().unique(), // ActivityPub global URI identifying this post
  content: text("content").notNull(),
  isLocal: boolean("is_local").default(false).notNull(),
  inReplyTo: text("in_reply_to"), // URI of the post this is replying to (if applicable)
  url: text("url"), // Public browser link to view the post
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const followers = pgTable(
  "followers",
  {
    id: uuid().defaultRandom().primaryKey(),
    followerActorUri: text("follower_actor_uri").notNull(),
    inboxUrl: text("inbox_url").notNull(),
    sharedInboxUrl: text("shared_inbox_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("follower_uri_idx").on(table.followerActorUri)],
);

export const following = pgTable(
  "following",
  {
    id: uuid().defaultRandom().primaryKey(),
    followingActorUri: text("following_actor_uri").notNull(),
    inboxUri: text("inbox_uri").notNull(),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("following_uri_idx").on(table.followingActorUri)],
);

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: text("type").notNull(), // 'mention', 'like', 'repost', 'follow'
  actorId: text("actor_id").notNull(),
  targetPostUri: text("target_post_uri"),
  linkedNotificationUri: text("linked_uri"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
