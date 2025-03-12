import { OAuthUser } from "@/http/services/oAuthService/OAuthProvider";
import { relations } from "drizzle-orm";
import { boolean, integer, jsonb, pgTable, varchar } from "drizzle-orm/pg-core";
import { agentsTable } from "./agentsTable";

export type Credentials = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export const agentPlatformsTable = pgTable("agentPlatforms", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  agentId: integer()
    .notNull()
    .references(() => agentsTable.id, { onDelete: "cascade" }),
  name: varchar({ length: 50 }).notNull(),
  type: varchar({ length: 50 }).$type<"twitter">().notNull(),
  description: varchar({ length: 255 }),
  credentials: jsonb().$type<Credentials>().notNull(),
  enabled: boolean().notNull().default(false),
  account: jsonb().$type<OAuthUser>().notNull(),
});

export const agentPlatformsRelations = relations(agentPlatformsTable, ({ one }) => ({
  agent: one(agentsTable, {
    fields: [agentPlatformsTable.agentId],
    references: [agentsTable.id],
  }),
}));

export type AgentPlatform = typeof agentPlatformsTable.$inferSelect;
