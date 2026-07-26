import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  uniqueIndex,
  integer,
  AnyPgColumn,
  jsonb,
} from "drizzle-orm/pg-core";

type MediaItem = {
  url: string;
  mimeType: string;
};

export const actors = pgTable("actors", {
  actorUri: text("actor_uri").primaryKey(),
  username: text("username").notNull(),
  domain: text("domain").notNull(),
  displayName: text("display_name"),
  summary: text("summary"),
  avatarUrl: text("avatar_url"),
  bannerUrl: text("banner_url"),
  publicKeyId: text("public_key_id").notNull(),
  publicKey: text("public_key").notNull(),
  inboxUrl: text("inbox_url").notNull(),
  sharedInboxUrl: text("shared_inbox_url"),
  isLocal: boolean("is_local").default(false).notNull(),
  lastFetchedAt: timestamp("last_fetched_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  privateKey: text("private_key").notNull(),
  actorUri: text("actor_uri")
    .notNull()
    .references(() => actors.actorUri, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: uuid().defaultRandom().primaryKey(),
  actorUri: text("actor_uri")
    .notNull()
    .references(() => actors.actorUri, { onDelete: "cascade" }),
  idUri: text("id_uri").notNull().unique(),
  content: text("content").notNull(),
  isLocal: boolean("is_local").default(false).notNull(),
  inReplyTo: text("in_reply_to").references((): AnyPgColumn => posts.idUri, {
    onDelete: "set null",
  }),
  url: text("url"),
  likeCount: integer("like_count").default(0).notNull(),
  boostCount: integer("boost_count").default(0).notNull(),
  replyCount: integer("reply_count").default(0).notNull(),
  mediaItems: jsonb("media_items").$type<MediaItem[]>().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const followers = pgTable(
  "followers",
  {
    id: uuid().defaultRandom().primaryKey(),
    followerActorUri: text("follower_actor_uri")
      .notNull()
      .references(() => actors.actorUri, { onDelete: "cascade" }),
    incomingFollowActivityId: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("follower_uri_idx").on(table.followerActorUri)],
);

export const following = pgTable(
  "following",
  {
    id: uuid().defaultRandom().primaryKey(),
    followedActorUri: text("followed_actor_uri")
      .notNull()
      .references(() => actors.actorUri, { onDelete: "cascade" }),
    status: text("status").notNull().default("pending"),
    followActivityId: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("followed_uri_idx").on(table.followedActorUri)],
);

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: text("type").notNull(),
  actorUri: text("actor_uri")
    .notNull()
    .references(() => actors.actorUri, { onDelete: "cascade" }),
  targetPostUri: text("target_post_uri"),
  activityId: text("activity_id").unique(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const interactions = pgTable(
  "interactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: text("type").notNull(), // Discriminating value: 'like' or 'boost'
    activityId: text("activity_id").notNull().unique(), // activityUri for undo operations
    actorUri: text("actor_uri")
      .notNull()
      .references(() => actors.actorUri, { onDelete: "cascade" }),
    postUri: text("post_uri")
      .notNull()
      .references(() => posts.idUri, { onDelete: "cascade" }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("interaction_unique").on(
      table.actorUri,
      table.postUri,
      table.type,
    ),
  ],
);

export const timelineEvents = pgTable("timeline_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: text("text").notNull(),
  actorUri: text("actor_uri")
    .notNull()
    .references(() => actors.actorUri, { onDelete: "cascade" }),
  postUri: text("post_uri")
    .notNull()
    .references(() => posts.idUri, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const media = pgTable("media", {
  key: text("key").primaryKey(),
  size: integer("size").notNull(),
  mimeType: text("mime_type").notNull(),
  version: integer("version").notNull().default(1),
});
