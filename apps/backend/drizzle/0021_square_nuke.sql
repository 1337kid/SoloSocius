ALTER TABLE "followers" ADD COLUMN "accepted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "following" ADD COLUMN "accepted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "followers" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "following" DROP COLUMN "status";