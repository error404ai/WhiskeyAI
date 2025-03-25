import { db } from "@/db/db";
import { agentTriggersTable, agentPlatformsTable } from "@/db/schema";
import { AgentTrigger } from "@/db/schema/agentTriggersTable";
import { agentTriggerCreateSchema } from "@/http/zodSchema/agentTriggerCreateSchema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import AuthService from "../authService";
import { AgentService } from "./AgentService";
import { TriggerSchedulerService } from "./TriggerSchedulerService";

export class AgentTriggerService {
  static async createAgentTrigger(data: z.infer<typeof agentTriggerCreateSchema>) {
    const agent = await AgentService.getAgentByUuid(data.agentUuid);
    if (!agent) throw new Error("Agent not found");
    const authUser = await AuthService.getAuthUser();
    if (!authUser) throw new Error("User not authenticated");
    if (Number(authUser.id) !== agent.userId) throw new Error("User not authenticated");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { agentUuid, ...triggerData } = data;
    
    // Calculate the initial nextRunAt timestamp
    const now = new Date();
    const nextRunAt = new Date(now);
    if (triggerData.runEvery === "minutes") {
      nextRunAt.setMinutes(now.getMinutes() + Number(triggerData.interval));
    } else if (triggerData.runEvery === "hours") {
      nextRunAt.setHours(now.getHours() + Number(triggerData.interval));
    } else if (triggerData.runEvery === "days") {
      nextRunAt.setDate(now.getDate() + Number(triggerData.interval));
    }
    
    const res = await db.insert(agentTriggersTable).values({
      ...triggerData,
      agentId: agent.id,
      interval: Number(triggerData.interval),
      nextRunAt: nextRunAt,
      status: "active",
    });
    
    if (res) {
      return true;
    } else {
      return false;
    }
  }

  static async testAgentTrigger(triggerId: number) {
    const authUser = await AuthService.getAuthUser();
    if (!authUser) throw new Error("User not authenticated");

    const trigger = await db.query.agentTriggersTable.findFirst({
      where: eq(agentTriggersTable.id, triggerId),
      with: {
        agent: {
          with:{
            user: true,
          }
        }
      },
    });

    if (!trigger) throw new Error("Trigger not found");
    if (Number(authUser.id) !== trigger.agent.userId) throw new Error("User not authenticated");

    // Check if Twitter is connected
    const twitterPlatform = await db.query.agentPlatformsTable.findFirst({
      where: and(
        eq(agentPlatformsTable.agentId, trigger.agentId),
        eq(agentPlatformsTable.type, "twitter"),
        eq(agentPlatformsTable.enabled, true)
      ),
    });

    if (!twitterPlatform) {
      throw new Error("Twitter account is not connected. Please connect your Twitter account in the Launch tab.");
    }

    // Initialize trigger scheduler service and process the trigger
    const scheduler = new TriggerSchedulerService();
    await scheduler.processTrigger(trigger);

    return true;
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

  static async toggleTriggerStatus(triggerId: number): Promise<boolean> {
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

    // Toggle the status between 'active' and 'paused'
    const newStatus = trigger.status === "active" ? "paused" : "active";

    const res = await db
      .update(agentTriggersTable)
      .set({
        status: newStatus,
      })
      .where(eq(agentTriggersTable.id, triggerId));

    return !!res;
  }

  static async updateAgentTrigger(triggerId: number, data: z.infer<typeof agentTriggerCreateSchema>): Promise<boolean> {
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

    // Calculate the next run time based on the updated interval
    const now = new Date();
    const nextRunAt = new Date(now);
    if (data.runEvery === "minutes") {
      nextRunAt.setMinutes(now.getMinutes() + Number(data.interval));
    } else if (data.runEvery === "hours") {
      nextRunAt.setHours(now.getHours() + Number(data.interval));
    }

    const res = await db
      .update(agentTriggersTable)
      .set({
        name: data.name,
        description: data.description,
        interval: Number(data.interval),
        runEvery: data.runEvery,
        functionName: data.functionName,
        informationSource: data.informationSource,
        nextRunAt: nextRunAt,
      })
      .where(eq(agentTriggersTable.id, triggerId));

    return !!res;
  }
  
  static async getTriggerById(triggerId: number): Promise<AgentTrigger | undefined> {
    const authUser = await AuthService.getAuthUser();
    if (!authUser) throw new Error("User not authenticated");

    const trigger = await db.query.agentTriggersTable.findFirst({
      where: eq(agentTriggersTable.id, triggerId),
      with: {
        agent: true,
      },
    });

    if (!trigger) return undefined;
    if (Number(authUser.id) !== trigger.agent.userId) throw new Error("User not authenticated");

    return trigger;
  }
}
