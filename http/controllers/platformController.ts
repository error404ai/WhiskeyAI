"use server";
import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { AgentPlatformService } from "../services/agent/AgentPlatformService";
import { SocialiteService } from "../services/oAuthService/SocialiteService";

interface ConnectTwitterParams {
  agentUuid: string;
  url: string;
}

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

export async function connectTwitter(params: ConnectTwitterParams | string) {
  const agentUuid = typeof params === "string" ? params : params.agentUuid;
  const returnUrl = typeof params === "string" ? undefined : params.url;

  const agent = await db.query.agentsTable.findFirst({
    where: (agents) => eq(agents.uuid, agentUuid),
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

  const state = Buffer.from(
    JSON.stringify({
      agentUuid,
      returnUrl,
    }),
  ).toString("base64");

  return socialite.driver("twitter").redirect({
    scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    state,
  });
}

export async function getAgentPlatformsByAgentUuid(agentUuid: string) {
  return AgentPlatformService.getAgentPlatformsByAgentUuid(agentUuid);
}

export async function deleteAgentPlatform(agentUuid: string, platformId: string) {
  return AgentPlatformService.deleteAgentPlatform(agentUuid, parseInt(platformId));
}
