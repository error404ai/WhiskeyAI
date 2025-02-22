import { relations } from "drizzle-orm";
import { date, integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { rolesTable } from "./roles";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  customer_id: varchar({ length: 255 })
    .notNull()
    .default(`CUS${new Date().getFullYear().toString().slice(-2)}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}${String(new Date().getHours()).padStart(2, "0")}${String(new Date().getMinutes()).padStart(2, "0")}${String(new Date().getSeconds()).padStart(2, "0")}${Math.floor(1000 + Math.random() * 9000)}`),
  name: varchar({ length: 255 }).notNull(),
  avatar: varchar({ length: 255 }),
  email: varchar({ length: 255 }).notNull().unique(),
  phone: varchar({ length: 255 }).unique(),
  country: varchar({ length: 255 }),
  street_address: varchar({ length: 255 }),
  date_of_birth: date({ mode: "string" }),
  password: varchar({ length: 255 }).notNull(),
  roleId: integer()
    .default(1)
    .notNull()
    .references(() => rolesTable.id),
  emailVerified: date(),
  emailVerificationToken: varchar({ length: 255 }),
  created_at: varchar({ length: 255 }).notNull().default("CURRENT_TIMESTAMP"),
  updated_at: varchar({ length: 255 }).notNull().default("CURRENT_TIMESTAMP"),
});

export type UserType = Omit<typeof usersTable.$inferSelect, "password"> & { password?: string };

export const usersRelations = relations(usersTable, ({ one }) => ({
  role: one(rolesTable, {
    fields: [usersTable.roleId],
    references: [rolesTable.id],
  }),
}));
