"use server";
import { AgentService } from "@/http/services/agent/AgentService";
import TwitterService from "@/http/services/TwitterService";

// Helper function to get Twitter service for an agent
const getTwitterServiceForAgent = async (agentUuid: string) => {
  const agent = await AgentService.getAgentByUuid(agentUuid);
  if (!agent) throw new Error("Agent not found");
  const platform = agent.agentPlatforms.find((platform) => platform.name === "twitter");
  if (!platform) throw new Error("No Twitter platform found for this agent");
  return new TwitterService(platform);
};

export const postTweet = async (agentUuid: string, text: string) => {
  const twitterService = await getTwitterServiceForAgent(agentUuid);
  return twitterService.postTweet(text);
};

export const getHomeTimeLine = async (agentUuid: string) => {
  const twitterService = await getTwitterServiceForAgent(agentUuid);
  return await twitterService.getHomeTimeLine();
};

export const replyTweet = async (agentUuid: string, text: string, tweetId: string) => {
  const twitterService = await getTwitterServiceForAgent(agentUuid);
  return await twitterService.replyTweet(text, tweetId);
};

export const likeTweet = async (agentUuid: string, tweetId: string) => {
  const twitterService = await getTwitterServiceForAgent(agentUuid);
  return await twitterService.likeTweet(tweetId);
};

export const quoteTweet = async (agentUuid: string, quotedTweetId: string, comment: string) => {
  const twitterService = await getTwitterServiceForAgent(agentUuid);
  return await twitterService.quoteTweet(quotedTweetId, comment);
};

export const reTweet = async (agentUuid: string, tweetId: string) => {
  const twitterService = await getTwitterServiceForAgent(agentUuid);
  return await twitterService.reTweet(tweetId);
};
