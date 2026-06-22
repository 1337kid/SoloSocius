import { relations } from "drizzle-orm";
import {
  actors,
  users,
  posts,
  followers,
  following,
  notifications,
  interactions,
} from "./schema.js";

export const actorsRelations = relations(actors, ({ many, one }) => ({
  user: one(users, {
    fields: [actors.actorUri],
    references: [users.actorUri],
  }),

  posts: many(posts),

  followers: many(followers),
  following: many(following),

  notifications: many(notifications),
  interactions: many(interactions),
}));

export const usersRelations = relations(users, ({ one }) => ({
  actor: one(actors, {
    fields: [users.actorUri],
    references: [actors.actorUri],
  }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  actor: one(actors, {
    fields: [posts.actorUri],
    references: [actors.actorUri],
  }),

  interactions: many(interactions),
}));

export const followersRelations = relations(followers, ({ one }) => ({
  actor: one(actors, {
    fields: [followers.followerActorUri],
    references: [actors.actorUri],
  }),
}));

export const followingRelations = relations(following, ({ one }) => ({
  actor: one(actors, {
    fields: [following.followedActorUri],
    references: [actors.actorUri],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  actor: one(actors, {
    fields: [notifications.actorUri],
    references: [actors.actorUri],
  }),
}));

export const interactionsRelations = relations(interactions, ({ one }) => ({
  actor: one(actors, {
    fields: [interactions.actorUri],
    references: [actors.actorUri],
  }),

  post: one(posts, {
    fields: [interactions.postUri],
    references: [posts.idUri],
  }),
}));
