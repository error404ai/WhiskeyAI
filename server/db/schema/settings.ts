import { boolean, decimal, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const settingsTable = pgTable("settings", {
  id: varchar("id", { length: 255 }).primaryKey(),
  solPaymentAmount: decimal("sol_payment_amount", { precision: 10, scale: 5 }).notNull().default("0.1"),
  telegramSessionString: text("telegram_session_string"),
  telegramBotToken: text("telegram_bot_token"),
  telegramApiId: varchar("telegram_api_id", { length: 255 }),
  telegramApiHash: varchar("telegram_api_hash", { length: 255 }),
  telegramPhoneNumber: varchar("telegram_phone_number", { length: 50 }),
  isTelegramAuthenticated: boolean("is_telegram_authenticated").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas for validation
export const insertSettingsSchema = createInsertSchema(settingsTable, {
  solPaymentAmount: z.number().min(0.001).max(10),
  telegramApiId: z.string().optional(),
  telegramApiHash: z.string().optional(),
  telegramPhoneNumber: z.string().optional(),
  telegramBotToken: z.string().optional(),
  telegramSessionString: z.string().optional(),
});

export const selectSettingsSchema = createSelectSchema(settingsTable);

export type settings = z.infer<typeof selectSettingsSchema>;
export type InsertSettings = z.infer<typeof selectSettingsSchema>;
