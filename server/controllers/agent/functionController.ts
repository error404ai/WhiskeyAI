"use server";

import { Function } from "@/server/db/schema";
import { FunctionService } from "@/server/services/agent/FunctionService";

export const getFunctions = async (type: "agent" | "trigger"): Promise<Function[]> => {
  return await FunctionService.getFunctions(type);
};
