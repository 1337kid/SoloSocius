ALTER TABLE "interactions" RENAME COLUMN "activity_uri" TO "activity_id";--> statement-breakpoint
ALTER TABLE "interactions" DROP CONSTRAINT "interactions_activity_uri_unique";--> statement-breakpoint
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_activity_id_unique" UNIQUE("activity_id");