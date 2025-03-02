import { AgentPlatformService } from "@/http/services/agent/agentPlatformService";
import { AgentService } from "@/http/services/agent/agentService";
import { SocialiteService } from "@/http/services/oAuthService/SocialiteService";
import { redirect } from "next/navigation";

export const GET = async (request: Request): Promise<Response> => {
  const twitterProvider = new SocialiteService().driver("twitter");
  const res = await twitterProvider.exchangeCodeForToken(request);
  console.log("res", res);
  const base64StateString = res.state as string;
  const stateString = atob(base64StateString);
  const state = JSON.parse(stateString);

  const agent = await AgentService.getAgent(state.agentUuid);
  if (!agent) throw new Error("Agent not found");
  AgentPlatformService.storeAgentPlatform({
    name: "twitter",
    agentId: agent.id,
    description: "twitter",
    enabled: true,
    type: "twitter",
    credentials: {
      accessToken: res.accessToken,
      refreshToken: res.refreshToken ?? "",
    },
  });
  return redirect(state.url);
};
