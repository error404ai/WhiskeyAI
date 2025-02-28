import { relations } from "drizzle-orm";
import { integer, jsonb, pgTable, varchar } from "drizzle-orm/pg-core";
import { agentsTable } from "./agentsTable";

export const agentPlatformsTable = pgTable("agentPlatforms", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  agentId: integer()
    .notNull()
    .references(() => agentsTable.id),
  platform_name: varchar({ length: 50 }).notNull(),
  credentials: jsonb().notNull(),
});

export const agentPlatformsRelations = relations(agentPlatformsTable, ({ one }) => ({
  agent: one(agentsTable, {
    fields: [agentPlatformsTable.agentId],
    references: [agentsTable.id],
  }),
}));
