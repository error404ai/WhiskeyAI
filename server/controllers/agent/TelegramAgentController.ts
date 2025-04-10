"use server";
import telegramService from "@/server/services/TelegramService";
import { TelegramResponse } from "@/types/telegram.d";

// Helper function to handle errors - ensuring serializable output
const handleTelegramError = (error: unknown): TelegramResponse => {
  console.error("Telegram API error:", error);

  // Convert the error to a string to ensure serializability
  const errorString = String(error);

  // Create a serializable error object (no Error instances)
  return {
    status: "error",
    message: `Telegram API error: ${errorString}`,
    errorDetails:
      typeof error === "object" && error !== null
        ? JSON.stringify(
            Object.getOwnPropertyNames(error).reduce(
              (acc, key) => {
                // @ts-expect-error - dynamic property access
                acc[key] = String(error[key]);
                return acc;
              },
              {} as Record<string, string>,
            ),
          )
        : String(error),
  };
};

export const getEntityInfo = async (username: string): Promise<TelegramResponse> => {
  try {
    await telegramService.connect();
    const entity = await telegramService.getEntity(username);
console.log( 'entity ' + entity)
    return {
      status: "success",
      data: entity,
    };
  } catch (error) {
    return handleTelegramError(error);
  } finally {
    await telegramService.disconnect();
  }
};

export const getChannelMessages = async (channelUsername: string, limit: number = 10): Promise<TelegramResponse> => {
  try {
    await telegramService.connect();
    const messages = await telegramService.getChannelMessages(channelUsername, limit);
    
    // Ensure the data is serializable by converting it to a plain object
    const serializableMessages = JSON.parse(JSON.stringify(messages));
    
    return {
      status: "success",
      data: serializableMessages,
    };
  } catch (error) {
    return handleTelegramError(error);
  } finally {
    await telegramService.disconnect();
  }
};

export const testConnection = async (): Promise<TelegramResponse> => {
  try {
    const isConnected = await telegramService.connect();
    return {
      status: "success",
      data: { connected: isConnected },
    };
  } catch (error) {
    return handleTelegramError(error);
  } finally {
    await telegramService.disconnect();
  }
}; 