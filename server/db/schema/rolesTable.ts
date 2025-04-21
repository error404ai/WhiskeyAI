import { relations } from "drizzle-orm";
import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./usersTable";

export const rolesTable = pgTable("roles", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
});

export const rolesRelations = relations(rolesTable, ({ many }) => ({
  users: many(usersTable),
}));

export type Role = typeof rolesTable.$inferSelect;
