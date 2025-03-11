"use server";
import { AgentPlatform } from "@/db/schema";
import { redirect } from "next/navigation";
import { AgentPlatformService } from "../services/agent/AgentPlatformService";
import { SocialiteService } from "../services/oAuthService/SocialiteService";

export const connectTwitter = async (state: { agentUuid: string; url: string }) => {
  const stateString = JSON.stringify(state);
  const base64StateString = btoa(stateString);
  const twitterProvider = new SocialiteService().driver("twitter");
  const redirectUrl = await twitterProvider.redirect({
    state: base64StateString,
    scopes: ["users.read", "tweet.read", "tweet.write", "offline.access", "like.read", "like.write"],
  });
  return redirect(redirectUrl);
};

export const getAgentPlatformsByAgentUuid = async (agentUuid: string): Promise<AgentPlatform[]> => {
  return await AgentPlatformService.getAgentPlatformsByAgentUuid(agentUuid);
};

export const deleteAgentPlatform = async (agentUuid: string, platformId: number) => {
  return await AgentPlatformService.deleteAgentPlatform(agentUuid, platformId);
};
