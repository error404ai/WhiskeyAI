import { db } from "@/server/db/db";
import { settingsTable } from "@/server/db/schema";
import { InsertSettings } from "@/server/db/schema/settings";
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
      const settings = await db.select().from(settingsTable).where(eq(settingsTable.id, SETTINGS_ID)).limit(1);

      // If settings don't exist, create default settings
      if (settings.length === 0) {
        const defaultSettings = {
          id: SETTINGS_ID,
          solPaymentAmount: "0.1", // Use string for decimal type
          default_max_agents_per_user: 50,
          isTelegramAuthenticated: false,
        };

        await db.insert(settingsTable).values(defaultSettings);
        return { success: true, settings: defaultSettings };
      }

      return { success: true, settings: settings[0] };
    } catch (error) {
      console.error("Error getting settings:", error);
      return { success: false, error: "Failed to get settings" };
    }
  }

  /**
   * Get default max agents per user setting
   */
  static async getDefaultMaxAgentsPerUser(): Promise<number> {
    try {
      const settings = await db.select({ default_max_agents_per_user: settingsTable.default_max_agents_per_user }).from(settingsTable).where(eq(settingsTable.id, SETTINGS_ID)).limit(1);

      if (settings.length === 0) {
        // If no settings found, create default settings and return default value
        await this.getSettings();
        return 50; // Default value
      }

      return settings[0].default_max_agents_per_user;
    } catch (error) {
      console.error("Error getting max agents setting:", error);
      return 50; // Return default in case of error
    }
  }

  /**
   * Update default max agents per user setting
   */
  static async updateDefaultMaxAgentsPerUser(value: number) {
    try {
      if (value < 1 || value > 100) {
        return { success: false, error: "Invalid value. Must be between 1 and 100" };
      }

      await db
        .update(settingsTable)
        .set({
          default_max_agents_per_user: value,
          updatedAt: new Date(),
        })
        .where(eq(settingsTable.id, SETTINGS_ID));

      return { success: true };
    } catch (error) {
      console.error("Error updating max agents setting:", error);
      return { success: false, error: "Failed to update max agents setting" };
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
        .update(settingsTable)
        .set({
          solPaymentAmount: amount.toString(), // Convert to string for db storage
          updatedAt: new Date(),
        })
        .where(eq(settingsTable.id, SETTINGS_ID));

      return { success: true };
    } catch (error) {
      console.error("Error updating SOL payment settings:", error);
      return { success: false, error: "Failed to update SOL payment settings" };
    }
  }

  /**
   * Update Telegram settings
   */
  static async updateTelegramSettings(telegramSettings: Partial<InsertSettings>) {
    try {
      // Extract only the Telegram-related properties to avoid type conflicts
      const { telegramApiId, telegramApiHash, telegramPhoneNumber, telegramBotToken, telegramSessionString, isTelegramAuthenticated } = telegramSettings;

      // Create an object with only the Telegram properties
      const validSettings: Partial<TelegramSettingsOnly> = {
        updatedAt: new Date(),
      };

      // Only add properties that are defined
      if (telegramApiId) validSettings.telegramApiId = telegramApiId;
      if (telegramApiHash) validSettings.telegramApiHash = telegramApiHash;
      if (telegramPhoneNumber) validSettings.telegramPhoneNumber = telegramPhoneNumber;
      if (telegramBotToken) validSettings.telegramBotToken = telegramBotToken;
      if (telegramSessionString) validSettings.telegramSessionString = telegramSessionString;
      if (isTelegramAuthenticated && isTelegramAuthenticated !== null) {
        validSettings.isTelegramAuthenticated = isTelegramAuthenticated;
      }

      await db.update(settingsTable).set(validSettings).where(eq(settingsTable.id, SETTINGS_ID));

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
        updatedAt: new Date(),
      };

      if (sessionString) {
        updateData.telegramSessionString = sessionString;
      }

      await db.update(settingsTable).set(updateData).where(eq(settingsTable.id, SETTINGS_ID));

      return { success: true };
    } catch (error) {
      console.error("Error updating Telegram authenticated status:", error);
      return { success: false, error: "Failed to update Telegram authenticated status" };
    }
  }
}
