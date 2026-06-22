CREATE TABLE "actors" (
	"actor_uri" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"domain" text NOT NULL,
	"display_name" text,
	"bio" text,
	"avatar_url" text,
	"public_key" text NOT NULL,
	"inbox_url" text NOT NULL,
	"shared_inbox_url" text,
	"is_local" boolean DEFAULT false NOT NULL,
	"last_fetched_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"activity_uri" text NOT NULL,
	"actor_uri" text NOT NULL,
	"post_uri" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "interactions_activity_uri_unique" UNIQUE("activity_uri")
);
--> statement-breakpoint
ALTER TABLE "boosted_posts" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "liked_posts" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "boosted_posts" CASCADE;--> statement-breakpoint
DROP TABLE "liked_posts" CASCADE;--> statement-breakpoint
ALTER TABLE "following" RENAME COLUMN "following_actor_uri" TO "followed_actor_uri";--> statement-breakpoint
ALTER TABLE "notifications" RENAME COLUMN "actor_id" TO "actor_uri";--> statement-breakpoint
ALTER TABLE "posts" RENAME COLUMN "actor_id" TO "actor_uri";--> statement-breakpoint
DROP INDEX "following_uri_idx";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "actor_uri" text NOT NULL;--> statement-breakpoint
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_actor_uri_actors_actor_uri_fk" FOREIGN KEY ("actor_uri") REFERENCES "public"."actors"("actor_uri") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_post_uri_posts_id_uri_fk" FOREIGN KEY ("post_uri") REFERENCES "public"."posts"("id_uri") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "followers" ADD CONSTRAINT "followers_follower_actor_uri_actors_actor_uri_fk" FOREIGN KEY ("follower_actor_uri") REFERENCES "public"."actors"("actor_uri") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "following" ADD CONSTRAINT "following_followed_actor_uri_actors_actor_uri_fk" FOREIGN KEY ("followed_actor_uri") REFERENCES "public"."actors"("actor_uri") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actor_uri_actors_actor_uri_fk" FOREIGN KEY ("actor_uri") REFERENCES "public"."actors"("actor_uri") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_actor_uri_actors_actor_uri_fk" FOREIGN KEY ("actor_uri") REFERENCES "public"."actors"("actor_uri") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_actor_uri_actors_actor_uri_fk" FOREIGN KEY ("actor_uri") REFERENCES "public"."actors"("actor_uri") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "followed_uri_idx" ON "following" USING btree ("followed_actor_uri");--> statement-breakpoint
ALTER TABLE "followers" DROP COLUMN "inbox_url";--> statement-breakpoint
ALTER TABLE "followers" DROP COLUMN "shared_inbox_url";--> statement-breakpoint
ALTER TABLE "following" DROP COLUMN "inbox_uri";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "display_name";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "bio";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "public_key";