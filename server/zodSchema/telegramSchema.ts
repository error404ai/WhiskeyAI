import { z } from "zod";

export const usernameSchema = z.object({
  username: z.string().nonempty("Username is required"),
});

export const channelMessagesSchema = z.object({
  channelUsername: z.string().nonempty("Channel username is required"),
  limit: z
    .string()
    .refine(
      (val) => {
        const num = parseInt(val, 10);
        return !isNaN(num) && num >= 1 && num <= 100;
      },
      { message: "Limit must be a number between 1 and 100" },
    )
    .default("10")
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
