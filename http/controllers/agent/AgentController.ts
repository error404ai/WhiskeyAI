"use server";

import { AgentService } from "@/http/services/agent/agentService";
import { agentCreateSchema } from "@/http/zodSchema/agentCreateSchema";
import { ZodError } from "zod";

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

export const deleteAgent = async (agentId: number): Promise<boolean> => {
  const res = await AgentService.deleteAgent(agentId);
  if (res) {
    return true;
  } else {
    return false;
  }
};
