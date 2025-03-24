import { integer, jsonb, pgEnum, pgTable, varchar } from "drizzle-orm/pg-core";

// Define PostgreSQL ENUMs
export const functionTypeEnum = pgEnum("function_type", ["agent", "trigger"]);
export const functionGroupEnum = pgEnum("function_group", ["twitter", "rpc", "dexscreener", "coinmarket"]);

export const functionsTable = pgTable("functions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
  description: varchar({ length: 500 }),
  parameters: jsonb().notNull(),
  type: functionTypeEnum("type").notNull(),
  group: functionGroupEnum("group").notNull(),
});

export type Function = typeof functionsTable.$inferSelect;
