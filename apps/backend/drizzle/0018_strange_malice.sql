ALTER TABLE "media" ADD COLUMN "type" text DEFAULT 'post' NOT NULL;--> statement-breakpoint
ALTER TABLE "media" DROP COLUMN "version";