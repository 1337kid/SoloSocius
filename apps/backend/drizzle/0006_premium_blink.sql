ALTER TABLE "actors" RENAME COLUMN "bio" TO "summary";--> statement-breakpoint
ALTER TABLE "followers" ADD COLUMN "incomingFollowActivityId" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "following" ADD COLUMN "followActivityId" text DEFAULT '';