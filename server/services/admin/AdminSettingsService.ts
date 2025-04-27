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
  static async getSettings() {
    try {
      const settings = await db.select().from(settingsTable).where(eq(settingsTable.id, SETTINGS_ID)).limit(1);

      if (settings.length === 0) {
        const defaultSettings = {
          id: SETTINGS_ID,
          solPaymentAmount: "0.1",
          default_max_agents_per_user: 50,
          telegramSessionString: "",
          telegramBotToken: "",
          telegramApiId: "",
          telegramApiHash: "",
          telegramPhoneNumber: "",
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

  static async getDefaultMaxAgentsPerUser(): Promise<number> {
    try {
      const settings = await db.select({ default_max_agents_per_user: settingsTable.default_max_agents_per_user }).from(settingsTable).where(eq(settingsTable.id, SETTINGS_ID)).limit(1);

      if (settings.length === 0) {
        await this.getSettings();
        return 50;
      }

      return settings[0].default_max_agents_per_user;
    } catch (error) {
      console.error("Error getting max agents setting:", error);
      return 50;
    }
  }

  static async updateDefaultMaxAgentsPerUser(value: number) {
    try {
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

  static async updateTelegramSettings(telegramSettings: Partial<InsertSettings>) {
    try {
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

      if (isAuthenticated && sessionString) {
        updateData.telegramSessionString = sessionString;
      } else if (!isAuthenticated) {
        // Explicitly clear the session string when resetting authentication
        updateData.telegramSessionString = "";
      }

      await db.update(settingsTable).set(updateData).where(eq(settingsTable.id, SETTINGS_ID));

      return { success: true };
    } catch (error) {
      console.error("Error updating Telegram authenticated status:", error);
      return { success: false, error: "Failed to update Telegram authenticated status" };
    }
  }
}
