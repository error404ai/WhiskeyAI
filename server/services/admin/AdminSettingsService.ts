import { db } from "@/db/db";
import { appSettingsTable } from "@/db/schema";
import { InsertAppSettings } from "@/db/schema/settings";
import { eq } from "drizzle-orm";

const SETTINGS_ID = "default";

// Type for the filtered settings object without solPaymentAmount
type TelegramSettingsOnly = {
  telegramApiId?: string;
  telegramApiHash?: string;
  telegramPhoneNumber?: string;
  telegramBotToken?: string;
  telegramSessionString?: string;
  isTelegramAuthenticated?: boolean;
  updatedAt: Date;
};

export class AdminSettingsService {
  /**
   * Get application settings
   */
  static async getSettings() {
    try {
      const settings = await db
        .select()
        .from(appSettingsTable)
        .where(eq(appSettingsTable.id, SETTINGS_ID))
        .limit(1);

      // If settings don't exist, create default settings
      if (settings.length === 0) {
        const defaultSettings = {
          id: SETTINGS_ID,
          solPaymentAmount: "0.1", // Use string for decimal type
          isTelegramAuthenticated: false,
        };
        
        await db.insert(appSettingsTable).values(defaultSettings);
        return { success: true, settings: defaultSettings };
      }

      return { success: true, settings: settings[0] };
    } catch (error) {
      console.error("Error getting settings:", error);
      return { success: false, error: "Failed to get settings" };
    }
  }

  /**
   * Update SOL payment amount setting
   */
  static async updateSolPayment(amount: number) {
    try {
      if (amount < 0.001 || amount > 10) {
        return { success: false, error: "Invalid amount. Must be between 0.001 and 10 SOL" };
      }

      await db
        .update(appSettingsTable)
        .set({ 
          solPaymentAmount: amount.toString(), // Convert to string for db storage
          updatedAt: new Date() 
        })
        .where(eq(appSettingsTable.id, SETTINGS_ID));

      return { success: true };
    } catch (error) {
      console.error("Error updating SOL payment settings:", error);
      return { success: false, error: "Failed to update SOL payment settings" };
    }
  }

  /**
   * Update Telegram settings
   */
  static async updateTelegramSettings(telegramSettings: Partial<InsertAppSettings>) {
    try {
      // Extract only the Telegram-related properties to avoid type conflicts
      const {
        telegramApiId,
        telegramApiHash,
        telegramPhoneNumber,
        telegramBotToken,
        telegramSessionString,
        isTelegramAuthenticated
      } = telegramSettings;
      
      // Create an object with only the Telegram properties
      const validSettings: Partial<TelegramSettingsOnly> = {
        updatedAt: new Date()
      };
      
      // Only add properties that are defined
      if (telegramApiId !== undefined) validSettings.telegramApiId = telegramApiId;
      if (telegramApiHash !== undefined) validSettings.telegramApiHash = telegramApiHash;
      if (telegramPhoneNumber !== undefined) validSettings.telegramPhoneNumber = telegramPhoneNumber;
      if (telegramBotToken !== undefined) validSettings.telegramBotToken = telegramBotToken;
      if (telegramSessionString !== undefined) validSettings.telegramSessionString = telegramSessionString;
      if (isTelegramAuthenticated !== undefined && isTelegramAuthenticated !== null) {
        validSettings.isTelegramAuthenticated = isTelegramAuthenticated;
      }
      
      await db
        .update(appSettingsTable)
        .set(validSettings)
        .where(eq(appSettingsTable.id, SETTINGS_ID));

      return { success: true };
    } catch (error) {
      console.error("Error updating Telegram settings:", error);
      return { success: false, error: "Failed to update Telegram settings" };
    }
  }

  /**
   * Update Telegram authenticated status
   */
  static async setTelegramAuthenticated(isAuthenticated: boolean, sessionString?: string) {
    try {
      const updateData: {
        isTelegramAuthenticated: boolean;
        updatedAt: Date;
        telegramSessionString?: string;
      } = { 
        isTelegramAuthenticated: isAuthenticated,
        updatedAt: new Date()
      };
      
      if (sessionString) {
        updateData.telegramSessionString = sessionString;
      }
      
      await db
        .update(appSettingsTable)
        .set(updateData)
        .where(eq(appSettingsTable.id, SETTINGS_ID));

      return { success: true };
    } catch (error) {
      console.error("Error updating Telegram authenticated status:", error);
      return { success: false, error: "Failed to update Telegram authenticated status" };
    }
  }
} 