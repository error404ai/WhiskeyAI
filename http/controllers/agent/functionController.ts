"use server";

import { Function } from "@/db/schema";
import { FunctionService } from "@/http/services/agent/FunctionService";

export const getFunctions = async (type: "agent" | "trigger"): Promise<Function[]> => {
  return await FunctionService.getFunctions(type);
};
