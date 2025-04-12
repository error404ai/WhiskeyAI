"use server";

import { NewScheduledTweet } from "@/db/schema";
import { ScheduledTweetService } from "@/server/services/ScheduledTweetService";
import { scheduledTweetSchema } from "@/server/zodSchema/scheduledTweetSchema";
import { z } from "zod";

/**
 * Interface for pagination parameters
 */
export interface PaginatedProps {
  page?: number;
  perPage?: number;
  search?: string;
  searchColumns?: string[];
  sortColumn?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Create a scheduled tweet
 * @param data The scheduled tweet data
 * @returns Success status and message
 */
export const createScheduledTweet = async (data: unknown): Promise<{ success: boolean; message?: string; id?: number }> => {
  try {
    const validatedData = scheduledTweetSchema.parse(data);
    const id = await ScheduledTweetService.createScheduledTweet(validatedData as NewScheduledTweet);
    return { success: true, id };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An unknown error occurred" };
  }
};

/**
 * Get all scheduled tweets for the current user with pagination support
 * @param pagination options for paginating and sorting results
 * @returns Paginated array of scheduled tweets
 */
export const getScheduledTweets = async (params: PaginatedProps = { page: 1, perPage: 10 }) => {
  try {
    return await ScheduledTweetService.getScheduledTweets(params);
  } catch (error) {
    console.error("Error getting scheduled tweets:", error);
    throw error;
  }
};

/**
 * Delete a scheduled tweet
 * @param tweetId The tweet ID to delete
 * @returns Success status
 */
export const deleteScheduledTweet = async (tweetId: number): Promise<{ success: boolean; message?: string }> => {
  try {
    const result = await ScheduledTweetService.deleteScheduledTweet(tweetId);
    return { success: result };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An unknown error occurred" };
  }
};

/**
 * Bulk create scheduled tweets
 * @param data Array of scheduled tweet data
 * @returns Success status and created IDs
 */
export const bulkCreateScheduledTweets = async (data: unknown): Promise<{ success: boolean; message?: string; ids?: number[] }> => {
  try {
    // Validate data is an array
    const arraySchema = z.array(scheduledTweetSchema);
    const validatedData = arraySchema.parse(data);
    
    // Process each tweet
    const ids = [];
    for (const tweet of validatedData) {
      const id = await ScheduledTweetService.createScheduledTweet(tweet as NewScheduledTweet);
      ids.push(id);
    }
    
    return { success: true, ids };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An unknown error occurred" };
  }
}; 