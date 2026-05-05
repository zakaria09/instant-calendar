CREATE TABLE "availability" (
	"id" serial PRIMARY KEY NOT NULL,
	"calendar_id" integer NOT NULL,
	"day" text NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "availability" ADD CONSTRAINT "availability_calendar_id_calendars_id_fk" FOREIGN KEY ("calendar_id") REFERENCES "public"."calendars"("id") ON DELETE cascade ON UPDATE no action;