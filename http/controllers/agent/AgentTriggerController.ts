"use server";

import { AgentTriggerService } from "@/http/services/agent/AgentTriggerService";
import { agentTriggerCreateSchema } from "@/http/zodSchema/agentTriggerCreateSchema";
import { z } from "zod";

export const createAgentTrigger = async (data: z.infer<typeof agentTriggerCreateSchema>) => {
  const parsedData = agentTriggerCreateSchema.parse(data);

  return AgentTriggerService.createAgentTrigger(parsedData);
};

export const getAgentTriggers = async (agentUuid: string) => {
  return await AgentTriggerService.getAgentTriggers(agentUuid);
};

export const deleteAgentTrigger = async (triggerId: number): Promise<boolean> => {
  return await AgentTriggerService.deleteAgentTrigger(triggerId);
};

export const toggleTriggerStatus = async (triggerId: number): Promise<boolean> => {
  return await AgentTriggerService.toggleTriggerStatus(triggerId);
};

export const getTriggerById = async (triggerId: number) => {
  return await AgentTriggerService.getTriggerById(triggerId);
};

export const updateAgentTrigger = async (triggerId: number, data: z.infer<typeof agentTriggerCreateSchema>) => {
  const parsedData = agentTriggerCreateSchema.parse(data);
  return await AgentTriggerService.updateAgentTrigger(triggerId, parsedData);
};
