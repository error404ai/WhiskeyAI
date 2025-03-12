import { z } from "zod";

// Define a standard error response schema
export const TwitterApiErrorSchema = z.object({
  status: z.literal("error"),
  code: z.number().optional(),
  message: z.string(),
  isRateLimit: z.boolean().default(false),
  details: z.any().optional(),
});

// Define a standard success response schema
export const TwitterApiResponseSchema = z.object({
  status: z.literal("success"),
  data: z.any(),
});

// Form validation schemas
export const tweetSchema = z.object({
  tweetText: z.string().min(1, "Tweet text is required").max(280, "Tweet cannot exceed 280 characters"),
});

export const replySchema = z.object({
  replyTweetId: z.string().min(1, "Tweet ID is required"),
  replyText: z.string().min(1, "Reply text is required").max(280, "Reply cannot exceed 280 characters"),
});

export const likeSchema = z.object({
  likeTweetId: z.string().min(1, "Tweet ID is required"),
});

export const quoteSchema = z.object({
  quoteTweetId: z.string().min(1, "Tweet ID is required"),
  quoteText: z.string().min(1, "Quote text is required").max(280, "Quote cannot exceed 280 characters"),
});

export const retweetSchema = z.object({
  retweetId: z.string().min(1, "Tweet ID is required"),
}); 