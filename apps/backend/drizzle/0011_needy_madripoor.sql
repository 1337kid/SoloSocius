CREATE TABLE "timeline_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text" text NOT NULL,
	"actor_uri" text NOT NULL,
	"post_uri" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_actor_uri_actors_actor_uri_fk" FOREIGN KEY ("actor_uri") REFERENCES "public"."actors"("actor_uri") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_post_uri_posts_id_uri_fk" FOREIGN KEY ("post_uri") REFERENCES "public"."posts"("id_uri") ON DELETE cascade ON UPDATE no action;