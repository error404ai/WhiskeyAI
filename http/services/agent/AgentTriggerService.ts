import { db } from "@/db/db";
import { agentTriggersTable } from "@/db/schema";
import { AgentTrigger } from "@/db/schema/agentTriggersTable";
import { agentTriggerCreateSchema } from "@/http/zodSchema/agentTriggerCreateSchema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import AuthService from "../authService";
import { AgentService } from "./agentService";

export class AgentTriggerService {
  static async createAgentTrigger(data: z.infer<typeof agentTriggerCreateSchema>) {
    const agent = await AgentService.getAgentByUuid(data.agentUuid);
    if (!agent) throw new Error("Agent not found");
    const authUser = await AuthService.getAuthUser();
    if (!authUser) throw new Error("User not authenticated");
    if (Number(authUser.id) !== agent.userId) throw new Error("User not authenticated");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { agentUuid, ...triggerData } = data;
    const res = await db.insert(agentTriggersTable).values({
      ...triggerData,
      agentId: agent.id,
      interval: Number(triggerData.interval),
    });
    if (res) {
      return true;
    } else {
      return false;
    }
  }
  static async getAgentTriggers(agentUuid: string): Promise<AgentTrigger[]> {
    const authUser = await AuthService.getAuthUser();
    const agent = await AgentService.getAgentByUuid(agentUuid);
    if (!agent || !authUser) throw new Error("User not authenticated");

    if (Number(authUser.id) !== agent.userId) throw new Error("User not authenticated");

    return await db.query.agentTriggersTable.findMany({
      where: eq(agentTriggersTable.agentId, agent.id),
    });
  }

  static async deleteAgentTrigger(triggerId: number): Promise<boolean> {
    const authUser = await AuthService.getAuthUser();
    if (!authUser) throw new Error("User not authenticated");
    const trigger = await db.query.agentTriggersTable.findFirst({
      where: eq(agentTriggersTable.id, triggerId),
      with: {
        agent: true,
      },
    });
    if (!trigger) throw new Error("Trigger not found");
    if (Number(authUser.id) !== trigger.agent.userId) throw new Error("User not authenticated");
    const res = await db.delete(agentTriggersTable).where(eq(agentTriggersTable.id, triggerId));
    if (res) {
      return true;
    } else {
      return false;
    }
  }
}
