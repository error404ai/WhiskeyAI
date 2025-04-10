import { z } from "zod";

export const usernameSchema = z.object({
  username: z.string().nonempty("Username is required"),
});

export const channelMessagesSchema = z.object({
  channelUsername: z.string().nonempty("Channel username is required"),
  limit: z
    .number()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(10)
    .optional(),
});

// Step 1: Send code schema
export const sendCodeSchema = z.object({
  phoneNumber: z.string().nonempty("Phone number is required"),
});

// Step 2: Verify code schema
export const verifyCodeSchema = z.object({
  sessionId: z.string().nonempty("Session ID is required"),
  phoneNumber: z.string().nonempty("Phone number is required"),
  phoneCode: z.string().nonempty("Verification code is required"),
  password: z.string().optional(),
}); 