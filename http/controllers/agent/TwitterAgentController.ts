"use server";
import { AgentService } from "@/http/services/agent/AgentService";
import TwitterService from "@/http/services/TwitterService";
import { TwitterResponse } from "@/types/twitter.d";

// Helper function to get Twitter service for an agent
const getTwitterServiceForAgent = async (agentUuid: string) => {
  const agent = await AgentService.getAgentByUuid(agentUuid);
  if (!agent) throw new Error("Agent not found");
  const platform = agent.agentPlatforms.find((platform) => platform.name === "twitter");
  if (!platform) throw new Error("No Twitter platform found for this agent");
  return new TwitterService(platform);
};

// Helper function to handle errors - ensuring serializable output
const handleTwitterError = (error: unknown): TwitterResponse => {
  console.error("Twitter API error:", error);

  // Convert the error to a string to ensure serializability
  const errorString = String(error);
  const isRateLimit = errorString.includes("429") || errorString.includes("rate limit");
  
  // Extract error code if available
  const codeMatch = errorString.match(/code (\d+)/);
  const code = codeMatch ? parseInt(codeMatch[1]) : undefined;
  
  // Create a serializable error object (no Error instances)
  return {
    status: "error",
    code,
    message: isRateLimit 
      ? "Twitter API rate limit exceeded. Please wait a few minutes before trying again." 
      : `Twitter API error: ${errorString}`,
    isRateLimit,
    // Convert error object to a safe string representation instead of passing the Error instance
    errorDetails: typeof error === 'object' && error !== null 
      ? JSON.stringify(Object.getOwnPropertyNames(error).reduce((acc, key) => {
          // @ts-ignore - dynamic property access
          acc[key] = String(error[key]);
          return acc;
        }, {} as Record<string, string>))
      : String(error)
  };
};

export const postTweet = async (agentUuid: string, text: string): Promise<TwitterResponse> => {
  try {
    const twitterService = await getTwitterServiceForAgent(agentUuid);
    const result = await twitterService.postTweet(text);
    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    return handleTwitterError(error);
  }
};

export const getHomeTimeLine = async (agentUuid: string): Promise<TwitterResponse> => {
  try {
    const twitterService = await getTwitterServiceForAgent(agentUuid);
    const result = await twitterService.getHomeTimeLine();
    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    return handleTwitterError(error);
  }
};

export const replyTweet = async (agentUuid: string, text: string, tweetId: string): Promise<TwitterResponse> => {
  try {
    const twitterService = await getTwitterServiceForAgent(agentUuid);
    const result = await twitterService.replyTweet(text, tweetId);
    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    return handleTwitterError(error);
  }
};

export const likeTweet = async (agentUuid: string, tweetId: string): Promise<TwitterResponse> => {
  try {
    const twitterService = await getTwitterServiceForAgent(agentUuid);
    const result = await twitterService.likeTweet(tweetId);
    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    return handleTwitterError(error);
  }
};

export const quoteTweet = async (agentUuid: string, quotedTweetId: string, comment: string): Promise<TwitterResponse> => {
  try {
    const twitterService = await getTwitterServiceForAgent(agentUuid);
    const result = await twitterService.quoteTweet(quotedTweetId, comment);
    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    return handleTwitterError(error);
  }
};

export const reTweet = async (agentUuid: string, tweetId: string): Promise<TwitterResponse> => {
  try {
    const twitterService = await getTwitterServiceForAgent(agentUuid);
    const result = await twitterService.reTweet(tweetId);
    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    return handleTwitterError(error);
  }
};
