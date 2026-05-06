CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text
);
--> statement-breakpoint
DROP TABLE "availability" CASCADE;--> statement-breakpoint
DROP TABLE "calendars" CASCADE;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;