import { AgentPlatformService } from "@/http/services/agent/AgentPlatformService";
import { AgentService } from "@/http/services/agent/AgentService";
import { SocialiteService } from "@/http/services/oAuthService/SocialiteService";
import { redirect } from "next/navigation";

export const GET = async (request: Request): Promise<Response> => {
  const twitterProvider = new SocialiteService().driver("twitter");
  const res = await twitterProvider.exchangeCodeForToken(request);
  const profile = await twitterProvider.getUserInfo(res.accessToken);
  console.log("res", res);
  console.log("profile", profile);
  const base64StateString = res.state as string;
  const stateString = atob(base64StateString);
  const state = JSON.parse(stateString);

  const agent = await AgentService.getAgentByUuid(state.agentUuid);
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
      expiresIn: res.expiresIn ?? 0,
    },
    account: profile,
  });
  return redirect(state.url);
};
