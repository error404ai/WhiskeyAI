import { relations } from "drizzle-orm";
import { integer, json, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { agentTriggersTable } from "./agentTriggersTable";
import { agentsTable } from "./agentsTable";
import { usersTable } from "./usersTable";

export const triggerLogsTable = pgTable("triggerLogs", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer().references(() => usersTable.id, { onDelete: "set null" }),
  agentId: integer().references(() => agentsTable.id, { onDelete: "set null" }),
  triggerId: integer().references(() => agentTriggersTable.id, { onDelete: "set null" }),
  functionName: text().notNull(),
  status: text().notNull(), // "success", "error", "no_trigger"
  executionTime: integer(), // in milliseconds
  errorDetails: text(), // Details if there was an error
  conversationData: json(), // Store AI chat conversation
  functionData: json(), // Store function call and response
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  metadata: json(), // For any additional data we might want to store
});

// Define relations for the logs table
export const triggerLogsRelations = relations(triggerLogsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [triggerLogsTable.userId],
    references: [usersTable.id],
  }),
  agent: one(agentsTable, {
    fields: [triggerLogsTable.agentId],
    references: [agentsTable.id],
  }),
  trigger: one(agentTriggersTable, {
    fields: [triggerLogsTable.triggerId],
    references: [agentTriggersTable.id],
  }),
}));

// TypeScript type definition for the logs table
export type TriggerLog = typeof triggerLogsTable.$inferSelect;
export type NewTriggerLog = typeof triggerLogsTable.$inferInsert;
