"use server";

import { AgentPlatformList } from "@/db/schema";
import { AgentService, ValidationResult } from "@/http/services/agent/AgentService";
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

/**
 * Check if the user has already paid for agent creation
 * @returns Boolean indicating payment status
 */
export const hasUserPaidForAgents = async (): Promise<boolean> => {
  return await AgentService.hasUserPaidForAgents();
};

/**
 * Count how many agents the user has created
 * @returns Number of agents
 */
export const countUserAgents = async (): Promise<number> => {
  return await AgentService.countUserAgents();
};

/**
 * Mark the user as having paid for agents
 * @param txSignature Transaction signature
 * @param amount Amount paid
 * @returns Success status or error object
 */
export const markUserAsPaid = async (txSignature: string, amount: string): Promise<boolean | { error: string }> => {
  return await AgentService.markUserAsPaid(txSignature, amount);
};

/**
 * Store payment information for a specific agent
 * @param agentId Agent ID
 * @param txSignature Transaction signature
 * @param amount Amount paid
 * @returns Success status
 */
export const storeAgentPaymentInfo = async (agentId: number, txSignature: string, amount: string): Promise<boolean> => {
  return await AgentService.storeAgentPaymentInfo(agentId, txSignature, amount);
};

/**
 * Update agent's token address after launch
 * @param agentUuid Agent UUID
 * @param tokenAddress Token address
 * @returns Success boolean
 */
export const updateAgentTokenAddress = async (agentUuid: string, tokenAddress: string): Promise<boolean> => {
  return await AgentService.updateAgentTokenAddress(agentUuid, tokenAddress);
};
