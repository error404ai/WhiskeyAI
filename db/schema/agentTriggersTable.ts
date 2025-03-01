import { relations } from "drizzle-orm";
import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { agentsTable } from "./agentsTable";

export const agentTriggersTable = pgTable("agentTriggers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  agentId: integer()
    .notNull()
    .references(() => agentsTable.id),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }).notNull(),
  interval: integer().notNull(),
  runEvery: varchar({ length: 255 }).notNull().$type<"minutes" | "hours">(),
  functionName: varchar({ length: 255 }).notNull(),
  informationSource: varchar({ length: 255 }).notNull(),
});

export const agentTriggersRelations = relations(agentTriggersTable, ({ one }) => ({
  agent: one(agentsTable, {
    fields: [agentTriggersTable.agentId],
    references: [agentsTable.id],
  }),
}));

export type AgentTrigger = typeof agentTriggersTable.$inferSelect;
