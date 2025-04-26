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
CREATE TABLE "agentPlatforms" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "agentPlatforms_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"agentId" integer NOT NULL,
	"name" varchar(50) NOT NULL,
	"type" varchar(50) NOT NULL,
	"description" varchar(255),
	"credentials" jsonb NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"account" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agentTriggers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "agentTriggers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"agentId" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"interval" integer NOT NULL,
	"runEvery" varchar(255) NOT NULL,
	"functionName" varchar(255) NOT NULL,
	"informationSource" varchar(255) NOT NULL,
	"lastRunAt" timestamp,
	"nextRunAt" timestamp,
	"status" varchar(50) DEFAULT 'active'
);
--> statement-breakpoint
CREATE TABLE "agents" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "agents_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"userId" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"tickerSymbol" varchar(255),
	"information" json,
	"triggers" json,
	"status" varchar(255) NOT NULL,
	"agentPlatformList" json,
	"txLink" varchar(255),
	"tokenAddress" varchar(255),
	"twitterClientId" varchar(255),
	"twitterClientSecret" varchar(255),
	"paymentTxSignature" varchar(255),
	"paymentAmount" varchar(50),
	"paymentTimestamp" varchar(255),
	CONSTRAINT "agents_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "functions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "functions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"description" varchar(500),
	"parameters" jsonb NOT NULL,
	"type" varchar(255) NOT NULL,
	"group" varchar(255) NOT NULL,
	CONSTRAINT "functions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "roles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"customer_id" varchar(255) NOT NULL,
	"publicKey" varchar(255) NOT NULL,
	"name" varchar(255),
	"avatar" varchar(255),
	"email" varchar(255),
	"roleId" integer DEFAULT 1 NOT NULL,
	"emailVerified" date,
	"hasPaidForAgents" boolean DEFAULT false NOT NULL,
	"has_unlimited_access" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_customer_id_unique" UNIQUE("customer_id"),
	CONSTRAINT "users_publicKey_unique" UNIQUE("publicKey")
);
--> statement-breakpoint
CREATE TABLE "triggerLogs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "triggerLogs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer,
	"agentId" integer,
	"triggerId" integer,
	"functionName" text NOT NULL,
	"status" text NOT NULL,
	"executionTime" integer,
	"errorDetails" text,
	"conversationData" json,
	"functionData" json,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" json
);
--> statement-breakpoint
CREATE TABLE "scheduledTweets" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "scheduledTweets_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"agentId" integer NOT NULL,
	"batchId" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"mediaUrl" text,
	"scheduledAt" timestamp with time zone NOT NULL,
	"status" varchar(50) DEFAULT 'pending',
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"processedAt" timestamp,
	"errorMessage" text
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
ALTER TABLE "adminCredentials" ADD CONSTRAINT "adminCredentials_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agentPlatforms" ADD CONSTRAINT "agentPlatforms_agentId_agents_id_fk" FOREIGN KEY ("agentId") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agentTriggers" ADD CONSTRAINT "agentTriggers_agentId_agents_id_fk" FOREIGN KEY ("agentId") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_roles_id_fk" FOREIGN KEY ("roleId") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "triggerLogs" ADD CONSTRAINT "triggerLogs_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "triggerLogs" ADD CONSTRAINT "triggerLogs_agentId_agents_id_fk" FOREIGN KEY ("agentId") REFERENCES "public"."agents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "triggerLogs" ADD CONSTRAINT "triggerLogs_triggerId_agentTriggers_id_fk" FOREIGN KEY ("triggerId") REFERENCES "public"."agentTriggers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduledTweets" ADD CONSTRAINT "scheduledTweets_agentId_agents_id_fk" FOREIGN KEY ("agentId") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;