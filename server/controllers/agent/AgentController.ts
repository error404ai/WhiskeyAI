"use server";

import { AgentPlatformList } from "@/db/schema";
import { AgentService, ValidationResult } from "@/server/services/agent/AgentService";
import { agentCreateSchema } from "@/server/zodSchema/agentCreateSchema";
import { agentInformationSchema } from "@/server/zodSchema/agentInformationSchema";
import { z } from "zod";

export const createAgent = async (data: unknown): Promise<{ success: boolean; message?: string }> => {
  try {
    const validatedData = agentCreateSchema.parse(data);
    const result = await AgentService.createAgent(validatedData);
    return { success: result };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "An unknown error occurred" };
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

export const storeAgentTxLink = async (agentUuid: string, txLink: string, tokenAddress: string): Promise<boolean> => {
  return await AgentService.storeAgentTxLink(agentUuid, txLink, tokenAddress);
};

export const deployAgent = async (agentUuid: string): Promise<boolean> => {
  return await AgentService.deployAgent(agentUuid);
};

export const toggleAgentStatus = async (agentUuid: string): Promise<boolean> => {
  return await AgentService.toggleAgentStatus(agentUuid);
};

export const validateAgentReadiness = async (agentUuid: string): Promise<ValidationResult> => {
  return await AgentService.validateAgentReadiness(agentUuid);
};

export const updateAgentTwitterCredentials = async (agentUuid: string, data: { clientId: string; clientSecret: string }): Promise<boolean> => {
  return await AgentService.updateAgentTwitterCredentials(agentUuid, data);
};

export const hasUserPaidForAgents = async (): Promise<boolean> => {
  return await AgentService.hasUserPaidForAgents();
};

export const countUserAgents = async (): Promise<number> => {
  return await AgentService.countUserAgents();
};

export const markUserAsPaid = async (txSignature: string, amount: string): Promise<boolean | { error: string }> => {
  return await AgentService.markUserAsPaid(txSignature, amount);
};

export const storeAgentPaymentInfo = async (agentId: number, txSignature: string, amount: string): Promise<boolean> => {
  return await AgentService.storeAgentPaymentInfo(agentId, txSignature, amount);
};

export const updateAgentTokenAddress = async (agentUuid: string, tokenAddress: string): Promise<boolean> => {
  return await AgentService.updateAgentTokenAddress(agentUuid, tokenAddress);
};
