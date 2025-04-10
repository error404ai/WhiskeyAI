"use server";
import telegramService from "@/server/services/TelegramService";
import { TelegramResponse } from "@/types/telegram.d";

// Helper function to handle errors - ensuring serializable output
const handleTelegramError = (error: unknown): TelegramResponse => {
  console.error("Telegram API error:", error);

  // Create a serializable error object
  return {
    status: "error",
    message: `Telegram API error: ${String(error)}`,
    errorDetails: typeof error === "object" && error !== null
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

// Step 1: Send verification code
export const sendCode = async (
  phoneNumber: string
): Promise<TelegramResponse> => {
  try {
    // Send code to the phone number
    const result = await telegramService.sendCode(phoneNumber);
    
    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    return handleTelegramError(error);
  }
};

// Step 2: Verify code and login
export const verifyCode = async (
  sessionId: string,
  phoneNumber: string,
  phoneCode: string,
  password?: string
): Promise<TelegramResponse> => {
  try {
    // Login with the verification code
    const authResult = await telegramService.login(
      sessionId,
      phoneNumber,
      phoneCode,
      password
    );
    
    return {
      status: "success",
      data: authResult,
    };
  } catch (error) {
    return handleTelegramError(error);
  }
};

export const getEntityInfo = async (username: string): Promise<TelegramResponse> => {
  try {
    await telegramService.connect();
    const entity = await telegramService.getEntity(username);
    
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
    
    // Ensure the data is serializable
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
    const authStatus = await telegramService.checkAuth();
    
    return {
      status: "success",
      data: { 
        connected: isConnected,
        authenticated: Boolean(authStatus),
        user: authStatus
      },
    };
  } catch (error) {
    return handleTelegramError(error);
  } finally {
    await telegramService.disconnect();
  }
}; 