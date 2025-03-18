import { relations } from "drizzle-orm";
import { integer, json, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { agentTriggersTable } from "./agentTriggersTable";
import { agentsTable } from "./agentsTable";
import { usersTable } from "./usersTable";

export const triggerLogsTable = pgTable("trigger_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id, { onDelete: "set null" }),
  agentId: integer("agent_id").references(() => agentsTable.id, { onDelete: "set null" }),
  triggerId: integer("trigger_id").references(() => agentTriggersTable.id, { onDelete: "set null" }),
  functionName: text("function_name").notNull(),
  status: text("status").notNull(), // "success", "error", "no_trigger"
  executionTime: integer("execution_time"), // in milliseconds
  errorDetails: text("error_details"), // Details if there was an error
  conversationData: json("conversation_data"), // Store AI chat conversation
  functionData: json("function_data"), // Store function call and response
  createdAt: timestamp("created_at").defaultNow().notNull(),
  metadata: json("metadata"), // For any additional data we might want to store
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
