ALTER TABLE "users" ADD COLUMN "max_agents" integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "default_max_agents_per_user" integer DEFAULT 50 NOT NULL;