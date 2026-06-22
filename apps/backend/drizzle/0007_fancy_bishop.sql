ALTER TABLE "followers" ALTER COLUMN "incomingFollowActivityId" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "followers" ALTER COLUMN "incomingFollowActivityId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "following" ALTER COLUMN "followActivityId" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "following" ALTER COLUMN "followActivityId" SET NOT NULL;