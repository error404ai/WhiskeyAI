/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/server/db/db";
import { Agent, type Function, agentPlatformsTable, agentTriggersTable, functionsTable } from "@/server/db/schema";
import { AgentTrigger } from "@/server/db/schema/agentTriggersTable";
import TwitterService from "@/server/services/TwitterService";
import { and, eq, lte, ne } from "drizzle-orm";
import { OpenAIService } from "../OpenAIService";
import { TriggerLogService } from "./TriggerLogService";

interface FunctionTool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
}

export class TriggerSchedulerService {
  private twitterService: TwitterService | null = null;
  private openAIService: OpenAIService;
  private userId: number = 0;

  constructor() {
    this.openAIService = new OpenAIService();
  }

  public async processPendingTriggers(): Promise<void> {
    try {
      const pendingTriggers = await this.getPendingTriggers();

      if (pendingTriggers.length === 0) {
        console.log("No pending triggers to process");
        return;
      }

      console.log(`Processing ${pendingTriggers.length} pending triggers`);

      for (const trigger of pendingTriggers) {
        await this.processTrigger(trigger);
      }

      console.log("Successfully processed all pending triggers");
    } catch (error) {
      console.error("Error processing pending triggers:", error);

      await TriggerLogService.logNoTriggersFound(this.userId, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private async getPendingTriggers() {
    const now = new Date();

    return await db.query.agentTriggersTable
      .findMany({
        where: and(eq(agentTriggersTable.status, "active"), lte(agentTriggersTable.nextRunAt || new Date(0), now)),
        with: {
          agent: {
            with: {
              user: true,
            },
          },
        },
      })
      .then((triggers) => {
        return triggers.filter((trigger) => trigger.agent.status === "running");
      });
  }

  public async processTrigger(trigger: AgentTrigger & { agent: Agent & { user: { id: number } } }): Promise<void> {
    this.userId = trigger.agent.user.id;
    const startTime = Date.now();
    const triggerData = {
      id: trigger.id,
      agentId: trigger.agentId,
      name: trigger.name,
      functionName: trigger.functionName,
    };

    console.log(`\n-----------------------------------------------`);
    console.log(`[Trigger] Processing trigger: ${trigger.name} (ID: ${trigger.id})`);
    console.log(`[Trigger] Agent ID: ${trigger.agentId}, Function: ${trigger.functionName}`);
    console.log(`-----------------------------------------------`);

    try {
      const functionDetails = await this.getFunctionDetails(trigger.functionName);
      if (!functionDetails) {
        console.error(`[Trigger] Function ${trigger.functionName} not found in database`);
        throw new Error(`Function ${trigger.functionName} not found`);
      }
      console.log(`[Trigger] Found function details for ${trigger.functionName}`);

      await this.initializeTwitterService(trigger.agentId);

      console.log(`[Trigger] Executing trigger function: ${trigger.functionName}`);

      const agentTools = await this.getAgentTools();
      const triggerTool = await this.getTriggerTool(trigger.functionName);
      const tools = [...agentTools, triggerTool];

      const result = await this.openAIService.executeWithAI(trigger, tools);

      await this.updateTriggerSchedule(trigger);

      const executionTime = Date.now() - startTime;

      const conversationData = this.openAIService.prepareConversationData(result);

      const functionData = {
        name: trigger.functionName,
        result: result,
        executedAt: new Date().toISOString(),
      };

      await TriggerLogService.logSuccessfulTrigger(triggerData, this.userId, executionTime, conversationData, functionData);

      console.log(`[Trigger] Successfully processed trigger ${trigger.id}`);
      console.log(`-----------------------------------------------\n`);
    } catch (error: any) {
      console.error(`[Trigger] *** ERROR PROCESSING TRIGGER ${trigger.id} ***`);
      console.error(`[Trigger] Error type: ${error.name || "Unknown"}`);
      console.error(`[Trigger] Error message: ${error.message}`);
      console.error(`[Trigger] Error details:`, error);
      console.error(`-----------------------------------------------\n`);

      const executionTime = Date.now() - startTime;

      await TriggerLogService.logFailedTrigger(triggerData, this.userId, error instanceof Error ? error.message : String(error), executionTime);

      await this.updateTriggerSchedule(trigger);
    }
  }

  private async initializeTwitterService(agentId: number): Promise<void> {
    const platform = await db.query.agentPlatformsTable.findFirst({
      where: and(eq(agentPlatformsTable.agentId, agentId), eq(agentPlatformsTable.type, "twitter"), eq(agentPlatformsTable.enabled, true)),
    });

    if (!platform) {
      console.error(`[Twitter] No enabled Twitter platform found for agent ${agentId}`);
      throw new Error("No enabled Twitter platform found for this agent");
    }

    console.log(`[Twitter] Found Twitter platform for agent ${agentId}`, {
      platformId: platform.id,
      enabled: platform.enabled,
    });

    try {
      this.twitterService = new TwitterService(platform);

      this.openAIService.setTwitterService(this.twitterService);

      console.log(`[Twitter] Successfully initialized Twitter service for agent ${agentId}`);
    } catch (error) {
      console.error(`[Twitter] Failed to initialize Twitter service for agent ${agentId}:`, error);
      throw error;
    }
  }

  private async getFunctionDetails(functionName: string): Promise<Function | undefined> {
    return await db.query.functionsTable.findFirst({
      where: eq(functionsTable.name, functionName),
    });
  }

  private async getAgentTools(): Promise<FunctionTool[]> {
    const agentFunctions = await db.query.functionsTable.findMany({
      where: ne(functionsTable.type, "trigger"),
    });

    return agentFunctions.map((func) => ({
      type: "function" as const,
      function: {
        name: func.name,
        description: func.description || "",
        parameters: func.parameters || {},
      },
    }));
  }

  private async getTriggerTool(functionName: string): Promise<FunctionTool> {
    const triggerFunction = await db.query.functionsTable.findFirst({
      where: and(eq(functionsTable.name, functionName), eq(functionsTable.type, "trigger")),
    });

    if (!triggerFunction) {
      throw new Error(`Trigger function ${functionName} not found in database`);
    }

    return {
      type: "function" as const,
      function: {
        name: triggerFunction.name,
        description: triggerFunction.description || "",
        parameters: triggerFunction.parameters || {},
      },
    };
  }

  private async updateTriggerSchedule(trigger: AgentTrigger): Promise<void> {
    const now = new Date();

    const nextRunAt = new Date(now);
    switch (trigger.runEvery) {
      case "minutes":
        nextRunAt.setMinutes(now.getMinutes() + trigger.interval);
        break;
      case "hours":
        nextRunAt.setHours(now.getHours() + trigger.interval);
        break;
      case "days":
        nextRunAt.setDate(now.getDate() + trigger.interval);
        break;
      default:
        throw new Error(`Unknown runEvery value: ${trigger.runEvery}`);
    }

    console.log(`Updating trigger schedule: next run at UTC ${nextRunAt.toISOString()}`);

    await db
      .update(agentTriggersTable)
      .set({
        lastRunAt: now,
        nextRunAt: nextRunAt,
      })
      .where(eq(agentTriggersTable.id, trigger.id));
  }
}
