import { z } from "zod";

export const scheduledTweetSchema = z.object({
  agentId: z.number().int().positive(),
  content: z.string().min(1).max(280),
  scheduledAt: z.coerce.date(),
  mediaUrl: z.string().optional(),
});

export type ScheduledTweetInput = z.infer<typeof scheduledTweetSchema>; 