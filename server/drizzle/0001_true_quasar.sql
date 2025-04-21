CREATE TABLE "adminCredentials" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "adminCredentials_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"username" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"created_at" varchar(255) DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	"updated_at" varchar(255) DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	CONSTRAINT "adminCredentials_userId_unique" UNIQUE("userId"),
	CONSTRAINT "adminCredentials_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"solPaymentAmount" numeric(10, 5) DEFAULT '0.1' NOT NULL,
	"telegramSessionString" text,
	"telegramBotToken" text,
	"telegramApiId" varchar(255),
	"telegramApiHash" varchar(255),
	"telegramPhoneNumber" varchar(50),
	"isTelegramAuthenticated" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DROP TABLE "admin_credentials" CASCADE;--> statement-breakpoint
DROP TABLE "app_settings" CASCADE;--> statement-breakpoint
ALTER TABLE "adminCredentials" ADD CONSTRAINT "adminCredentials_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;