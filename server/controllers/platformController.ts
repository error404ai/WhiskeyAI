"use server";
import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { AgentPlatformService } from "../services/agent/AgentPlatformService";
import SocialiteService from "../services/oAuthService/SocialiteService";

export async function checkTwitterCredentials(agentUuid: string): Promise<boolean> {
  const agent = await db.query.agentsTable.findFirst({
    where: (agents) => eq(agents.uuid, agentUuid),
    columns: {
      twitterClientId: true,
      twitterClientSecret: true,
    },
  });

  return !!(agent?.twitterClientId && agent?.twitterClientSecret);
}

export const connectTwitter = async (state: { agentUuid: string; url: string }) => {
  const stateString = JSON.stringify(state);
  const base64StateString = btoa(stateString);
  const agent = await db.query.agentsTable.findFirst({
    where: (agents) => eq(agents.uuid, state.agentUuid),
    columns: {
      twitterClientId: true,
      twitterClientSecret: true,
    },
  });

  if (!agent?.twitterClientId || !agent?.twitterClientSecret) {
    throw new Error("Please set up your Twitter Developer credentials first. Go to the Launch tab and enter your Client ID and Client Secret.");
  }

  const socialite = new SocialiteService({
    clientId: agent.twitterClientId,
    clientSecret: agent.twitterClientSecret,
  });

  return socialite.driver("twitter").redirect({
    scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    state: base64StateString,
  });
};

export async function getAgentPlatformsByAgentUuid(agentUuid: string) {
  return AgentPlatformService.getAgentPlatformsByAgentUuid(agentUuid);
}

export async function deleteAgentPlatform(agentUuid: string, platformId: string) {
  return AgentPlatformService.deleteAgentPlatform(agentUuid, parseInt(platformId));
}
