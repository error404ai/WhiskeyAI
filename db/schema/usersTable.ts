import { relations } from "drizzle-orm";
import { date, integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { rolesTable } from "./rolesTable";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  customer_id: varchar({ length: 255 })
    .notNull()
    .unique()
    .default(`CUS${new Date().getFullYear().toString().slice(-2)}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}${String(new Date().getHours()).padStart(2, "0")}${String(new Date().getMinutes()).padStart(2, "0")}${String(new Date().getSeconds()).padStart(2, "0")}${Math.floor(1000 + Math.random() * 9000)}`),
  publicKey: varchar({ length: 255 }).notNull(),
  name: varchar({ length: 255 }),
  avatar: varchar({ length: 255 }),
  email: varchar({ length: 255 }),
  roleId: integer()
    .default(1)
    .notNull()
    .references(() => rolesTable.id),
  emailVerified: date(),
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
