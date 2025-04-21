import { relations } from "drizzle-orm";
import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./usersTable";

export const adminCredentialsTable = pgTable("adminCredentials", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer()
    .notNull()
    .references(() => usersTable.id)
    .unique(),
  username: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  created_at: varchar({ length: 255 }).notNull().default("CURRENT_TIMESTAMP"),
  updated_at: varchar({ length: 255 }).notNull().default("CURRENT_TIMESTAMP"),
});

export type AdminCredentialType = typeof adminCredentialsTable.$inferSelect;

export const adminCredentialsRelations = relations(adminCredentialsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [adminCredentialsTable.userId],
    references: [usersTable.id],
  }),
}));
