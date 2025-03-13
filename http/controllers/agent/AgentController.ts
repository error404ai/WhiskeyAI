"use server";

import { AgentPlatformList } from "@/db/schema";
import { AgentService } from "@/http/services/agent/AgentService";
import { agentCreateSchema } from "@/http/zodSchema/agentCreateSchema";
import { agentInformationSchema } from "@/http/zodSchema/agentInformationSchema";
import { z, ZodError } from "zod";

export const createAgent = async (data: unknown): Promise<boolean | string> => {
  try {
    const validatedData = agentCreateSchema.parse(data);
    return await AgentService.createAgent(validatedData);
  } catch (error) {
    throw new ZodError([{ code: "custom", message: String(error), path: ["message"] }]);
  }
};

export const getAgents = async () => {
  return await AgentService.getAgents();
};

export const getAgentByUuid = async (agentUuid: string) => {
  return await AgentService.getAgentByUuid(agentUuid);
};

export const deleteAgent = async (agentId: number): Promise<boolean> => {
  const res = await AgentService.deleteAgent(agentId);
  if (res) {
    return true;
  } else {
    return false;
  }
};

export const saveAgentInformation = async (agentUuid: string, data: z.infer<typeof agentInformationSchema>): Promise<boolean> => {
  const parsedData = agentInformationSchema.parse(data);
  return await AgentService.saveAgentInformation(agentUuid, parsedData);
};

export const storeAgentPlatformList = async (agentUuid: string, data: AgentPlatformList[]) => {
  return await AgentService.storeAgentPlatformList(agentUuid, data);
};

export const storeAgentTxLink = async (agentUuid: string, txLink: string): Promise<boolean> => {
  return await AgentService.storeAgentTxLink(agentUuid, txLink);
};

export const deployAgent = async (agentUuid: string): Promise<boolean> => {
  return await AgentService.deployAgent(agentUuid);
};
