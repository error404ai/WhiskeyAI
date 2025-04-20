'use server'
import { AdminSettingsService } from "@/server/services/admin/AdminSettingsService";
import AuthService from "@/server/services/auth/authService";
import { z } from "zod";

// Validation schema for SOL payment update
const solPaymentSchema = z.object({
  amount: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0.001 && num <= 10;
    },
    {
      message: "Amount must be a number between 0.001 and 10 SOL",
    }
  ),
});

// Validation schema for Telegram settings
const telegramSettingsSchema = z.object({
  telegramApiId: z.string().optional(),
  telegramApiHash: z.string().optional(),
  telegramPhoneNumber: z.string().optional(),
  telegramBotToken: z.string().optional(),
});

// Utility function to check if user is admin
async function checkAdminAccess() {
  const authUser = await AuthService.getAuthUser();
  if (!authUser || !authUser.isAdmin) {
    throw new Error("Unauthorized access. Admin privileges required.");
  }
  return authUser;
}

// Controller functions
export async function getSettings() {
  await checkAdminAccess();
  return await AdminSettingsService.getSettings();
}

export async function updateSolPayment(amountStr: string) {
  try {
    // Verify admin access
    await checkAdminAccess();
    
    // Validate input
    const { amount } = solPaymentSchema.parse({ amount: amountStr });
    const numAmount = parseFloat(amount);
    
    // Update the setting
    return await AdminSettingsService.updateSolPayment(numAmount);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: error instanceof Error ? error.message : "Invalid payment amount" };
  }
}

export async function updateTelegramSettings(settings: Record<string, string>) {
  try {
    // Verify admin access
    await checkAdminAccess();
    
    // Validate input
    const validatedSettings = telegramSettingsSchema.parse(settings);
    
    // Update settings
    return await AdminSettingsService.updateTelegramSettings(validatedSettings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: error instanceof Error ? error.message : "Invalid Telegram settings" };
  }
}

export async function setTelegramAuthenticated(isAuthenticated: boolean, sessionString?: string) {
  try {
    // Verify admin access
    await checkAdminAccess();
    
    return await AdminSettingsService.setTelegramAuthenticated(isAuthenticated, sessionString);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Authentication update failed" };
  }
} 