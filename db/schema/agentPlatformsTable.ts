import { relations } from "drizzle-orm";
import { boolean, integer, jsonb, pgTable, varchar } from "drizzle-orm/pg-core";
import { agentsTable } from "./agentsTable";

type Credentials = {
  accessToken: string;
  refreshToken: string;
};

export const agentPlatformsTable = pgTable("agentPlatforms", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  agentId: integer()
    .notNull()
    .references(() => agentsTable.id, { onDelete: "cascade" }),
  name: varchar({ length: 50 }).notNull(),
  type: varchar({ length: 50 }).$type<"twitter" | "discord" | "telegram">().notNull(),
  description: varchar({ length: 255 }),
  credentials: jsonb().$type<Credentials>().notNull(),
  enabled: boolean().notNull().default(false),
});

export const agentPlatformsRelations = relations(agentPlatformsTable, ({ one }) => ({
  agent: one(agentsTable, {
    fields: [agentPlatformsTable.agentId],
    references: [agentsTable.id],
  }),
}));

export type AgentPlatform = typeof agentPlatformsTable.$inferSelect;
