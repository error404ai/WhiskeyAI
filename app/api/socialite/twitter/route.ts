import { AgentPlatformService } from "@/http/services/agent/AgentPlatformService";
import { AgentService } from "@/http/services/agent/AgentService";
import SocialiteService from "@/http/services/oAuthService/SocialiteService";
import { redirect } from "next/navigation";

export const GET = async (request: Request): Promise<Response> => {
  // Decode state from URL parameter
  const url = new URL(request.url);
  const stateParam = url.searchParams.get('state');
  
  if (!stateParam) {
    throw new Error("Missing state parameter");
  }
  
  const base64StateString = stateParam;
  const stateString = atob(base64StateString);
  const state = JSON.parse(stateString);

  // Get agent information including Twitter credentials
  const agent = await AgentService.getAgentByUuid(state.agentUuid);
  if (!agent) throw new Error("Agent not found");
  
  if (!agent.twitterClientId || !agent.twitterClientSecret) {
    throw new Error("Twitter credentials not found for this agent");
  }

  // Initialize Twitter provider with agent credentials
  const twitterCredentials = {
    clientId: agent.twitterClientId,
    clientSecret: agent.twitterClientSecret
  };
  
  const twitterProvider = new SocialiteService(twitterCredentials).driver("twitter");
  
  // Exchange code for token
  const res = await twitterProvider.exchangeCodeForToken(request);
  const profile = await twitterProvider.getUserInfo(res.accessToken);

  // Store the platform credentials
  await AgentPlatformService.storeAgentPlatform({
    name: "twitter",
    agentId: agent.id,
    description: "twitter",
    enabled: true,
    type: "twitter",
    credentials: {
      accessToken: res.accessToken,
      refreshToken: res.refreshToken ?? "",
      expiresIn: res.expiresIn ?? 0,
      expiryTimestamp: res.expiresIn ? Math.floor(Date.now() / 1000) + res.expiresIn : 0,
    },
    account: profile,
  });

  return redirect(state.url);
};
