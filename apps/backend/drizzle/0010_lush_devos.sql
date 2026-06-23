ALTER TABLE "notifications" RENAME COLUMN "linked_uri" TO "activity_id";--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_activity_id_unique" UNIQUE("activity_id");