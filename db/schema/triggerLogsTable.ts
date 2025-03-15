import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp, json } from "drizzle-orm/pg-core";
import { agentTriggersTable } from "./agentTriggersTable";
import { agentsTable } from "./agentsTable";
import { usersTable } from "./usersTable";

export const triggerLogsTable = pgTable("trigger_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  agentId: integer("agent_id").notNull().references(() => agentsTable.id),
  triggerId: integer("trigger_id").notNull().references(() => agentTriggersTable.id),
  functionName: text("function_name").notNull(),
  step: text("step").notNull(), // e.g., "init", "execution_start", "tool_call", "execution_complete", "error"
  status: text("status").notNull(), // e.g., "success", "error", "pending"
  message: text("message"),
  requestData: json("request_data"), // Store function arguments, etc.
  responseData: json("response_data"), // Store function results
  createdAt: timestamp("created_at").defaultNow().notNull(),
  executionTime: integer("execution_time"), // in milliseconds
  errorDetails: text("error_details"),
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