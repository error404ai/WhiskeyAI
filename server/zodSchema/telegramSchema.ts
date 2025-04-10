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