import { relations } from "drizzle-orm";
import { integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { agentsTable } from "./agentsTable";

export const scheduledTweetsTable = pgTable("scheduledTweets", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  agentId: integer()
    .notNull()
    .references(() => agentsTable.id, { onDelete: "cascade" }),
  batchId: varchar({ length: 50 }).notNull(),
  content: text().notNull(),
  scheduledAt: timestamp("scheduledAt", { withTimezone: true }).notNull(),
  status: varchar({ length: 50 }).$type<"pending" | "completed" | "failed" | "canceled">().default("pending"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  processedAt: timestamp(),
  errorMessage: text(),
});

export const scheduledTweetsRelations = relations(scheduledTweetsTable, ({ one }) => ({
  agent: one(agentsTable, {
    fields: [scheduledTweetsTable.agentId],
    references: [agentsTable.id],
  }),
}));

export type ScheduledTweet = typeof scheduledTweetsTable.$inferSelect;
export type NewScheduledTweet = typeof scheduledTweetsTable.$inferInsert;
