import { relations } from "drizzle-orm";
import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./usersTable";

export const agentsTable = pgTable("agents", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer()
    .notNull()
    .references(() => usersTable.id),
  name: varchar({ length: 255 }).notNull(),
  tickerSymbol: varchar({ length: 255 }).notNull(),
});

export const agentsRelations = relations(agentsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [agentsTable.user_id],
    references: [usersTable.id],
  }),
}));
