import { relations } from "drizzle-orm";
import { boolean, date, integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { rolesTable } from "./rolesTable";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  customer_id: varchar({ length: 255 }).notNull().unique(),
  publicKey: varchar({ length: 255 }).notNull().unique(),
  name: varchar({ length: 255 }),
  avatar: varchar({ length: 255 }),
  email: varchar({ length: 255 }),
  roleId: integer()
    .default(1)
    .notNull()
    .references(() => rolesTable.id),
  emailVerified: date(),
  hasPaidForAgents: boolean().default(false).notNull(),
  created_at: varchar({ length: 255 }).notNull().default("CURRENT_TIMESTAMP"),
  updated_at: varchar({ length: 255 }).notNull().default("CURRENT_TIMESTAMP"),
});

export type UserType = typeof usersTable.$inferSelect;

export const usersRelations = relations(usersTable, ({ one }) => ({
  role: one(rolesTable, {
    fields: [usersTable.roleId],
    references: [rolesTable.id],
  }),
}));
