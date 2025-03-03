import { integer, jsonb, pgTable, varchar } from "drizzle-orm/pg-core";

export const functionsTable = pgTable("functions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
  description: varchar({ length: 500 }),
  parameters: jsonb().notNull(),
  type: varchar({ length: 255 }).notNull().$type<"agent" | "trigger">(),
});

export type Function = typeof functionsTable.$inferSelect;
