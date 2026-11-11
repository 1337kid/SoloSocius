CREATE TABLE "relays" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"relay_name" text NOT NULL,
	"inbox_url" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL
);
