ALTER TABLE "boosted_posts" ADD COLUMN "activity_uri" text NOT NULL;--> statement-breakpoint
ALTER TABLE "liked_posts" ADD COLUMN "activity_uri" text NOT NULL;--> statement-breakpoint
ALTER TABLE "boosted_posts" ADD CONSTRAINT "boosted_posts_activity_uri_unique" UNIQUE("activity_uri");--> statement-breakpoint
ALTER TABLE "liked_posts" ADD CONSTRAINT "liked_posts_activity_uri_unique" UNIQUE("activity_uri");