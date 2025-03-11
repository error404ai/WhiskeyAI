"use server";
import { AgentService } from "@/http/services/agent/AgentService";
import TwitterService from "@/http/services/TwitterService";

export const postTweet = async (agentUuid: string, text: string) => {
  const agent = await AgentService.getAgentByUuid(agentUuid);
  if (!agent) throw new Error("Agent not found");
  const platform = agent.agentPlatforms.find((platform) => platform.name === "twitter");
  if (!platform) throw new Error("No platform found");
  const twitterService = new TwitterService(platform);
  return twitterService.postTweet(text);
};

export const getHomeTimeLine = async (agentUuid: string) => {
  const agent = await AgentService.getAgentByUuid(agentUuid);
  if (!agent) throw new Error("Agent not found");
  const platform = agent.agentPlatforms.find((platform) => platform.name === "twitter");
  if (!platform) throw new Error("No platform found");
  const twitterService = new TwitterService(platform);

  return await twitterService.getHomeTimeLine();
};

export const searchTwitter = async (agentUuid: string, query: string) => {
  const agent = await AgentService.getAgentByUuid(agentUuid);
  if (!agent) throw new Error("Agent not found");
  const platform = agent.agentPlatforms.find((platform) => platform.name === "twitter");
  if (!platform) throw new Error("No platform found");
  const twitterService = new TwitterService(platform);

  return await twitterService.searchTwitter(query);
};
