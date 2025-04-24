import { boolean, decimal, integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const settingsTable = pgTable("settings", {
  id: varchar("id", { length: 255 }).primaryKey(),
  solPaymentAmount: decimal({ precision: 10, scale: 5 }).notNull().default("0.1"),
  default_max_agents_per_user: integer("default_max_agents_per_user").notNull().default(50),
  telegramSessionString: text(),
  telegramBotToken: text(),
  telegramApiId: varchar({ length: 255 }),
  telegramApiHash: varchar({ length: 255 }),
  telegramPhoneNumber: varchar({ length: 50 }),
  isTelegramAuthenticated: boolean().default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas for validation
export const insertSettingsSchema = createInsertSchema(settingsTable, {
  solPaymentAmount: z.number().min(0.001).max(10),
  default_max_agents_per_user: z.number().min(1).max(100),
  telegramApiId: z.string().optional(),
  telegramApiHash: z.string().optional(),
  telegramPhoneNumber: z.string().optional(),
  telegramBotToken: z.string().optional(),
  telegramSessionString: z.string().optional(),
});

export const selectSettingsSchema = createSelectSchema(settingsTable);

export type settings = z.infer<typeof selectSettingsSchema>;
export type InsertSettings = z.infer<typeof selectSettingsSchema>;
