"use server";

import { NewScheduledTweet } from "@/db/schema";
import { ScheduledTweetService } from "@/server/services/ScheduledTweetService";
import { scheduledTweetSchema } from "@/server/zodSchema/scheduledTweetSchema";
import { z } from "zod";

export interface PaginatedProps {
  page?: number;
  perPage?: number;
  search?: string;
  searchColumns?: string[];
  sortColumn?: string;
  sortOrder?: "asc" | "desc";
}

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

export const getScheduledTweets = async (params: PaginatedProps = { page: 1, perPage: 10 }) => {
  try {
    return await ScheduledTweetService.getScheduledTweets(params);
  } catch (error) {
    console.error("Error getting scheduled tweets:", error);
    throw error;
  }
};

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

export const bulkCreateScheduledTweets = async (data: unknown): Promise<{ success: boolean; message?: string; ids?: number[] }> => {
  try {
    const batchId = String(Date.now());
    // Validate data is an array
    const arraySchema = z.array(scheduledTweetSchema);
    const validatedData = arraySchema.parse(data);

    // Process each tweet
    const ids = [];
    for (const tweet of validatedData) {
      const tweetWithBatchId = { ...tweet, batchId };
      const id = await ScheduledTweetService.createScheduledTweet(tweetWithBatchId as NewScheduledTweet);
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
