CREATE TABLE "media" (
	"key" text PRIMARY KEY NOT NULL,
	"size" integer NOT NULL,
	"mime_type" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "media_items" jsonb DEFAULT '[]'::jsonb;