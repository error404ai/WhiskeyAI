/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/db/db";
import { Agent, type Function, agentPlatformsTable, agentTriggersTable, functionsTable } from "@/db/schema";
import { AgentTrigger } from "@/db/schema/agentTriggersTable";
import TwitterService from "@/http/services/TwitterService";
import { and, eq, lte } from "drizzle-orm";
import { TriggerLogService } from "./TriggerLogService";
import { OpenAIService } from "../OpenAIService";

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

      // Process each trigger
      for (const trigger of pendingTriggers) {
        await this.processTrigger(trigger);
      }
      
      console.log("Successfully processed all pending triggers");
    } catch (error) {
      console.error("Error processing pending triggers:", error);
      
      // Log critical errors
      await TriggerLogService.logNoTriggersFound(
        this.userId, 
        {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        }
      );
    }
  }


  private async getPendingTriggers() {
    const now = new Date();

    return await db.query.agentTriggersTable.findMany({
      where: and(
        eq(agentTriggersTable.status, "active"), 
        lte(agentTriggersTable.nextRunAt || new Date(0), now)
      ),
      with: {
        agent: {
          with: {
            user: true
          }
        },
      },
    }).then(triggers => {
      // Filter out triggers whose agent is paused
      return triggers.filter(trigger => trigger.agent.status === "running");
    });
  }

 
  private async processTrigger(trigger: AgentTrigger & { agent: Agent & { user: { id: number } } }): Promise<void> {
    this.userId = trigger.agent.user.id;
    this.openAIService.setUserId(this.userId);
    
    // Start the execution timer
    const startTime = Date.now();
    const triggerData = { 
      id: trigger.id, 
      agentId: trigger.agentId, 
      name: trigger.name, 
      functionName: trigger.functionName 
    };
    
    console.log(`\n-----------------------------------------------`);
    console.log(`[Trigger] Processing trigger: ${trigger.name} (ID: ${trigger.id})`);
    console.log(`[Trigger] Agent ID: ${trigger.agentId}, Function: ${trigger.functionName}`);
    console.log(`-----------------------------------------------`);
    
    try {
      // Get function details
      const functionDetails = await this.getFunctionDetails(trigger.functionName);
      if (!functionDetails) {
        console.error(`[Trigger] Function ${trigger.functionName} not found in database`);
        throw new Error(`Function ${trigger.functionName} not found`);
      }
      console.log(`[Trigger] Found function details for ${trigger.functionName}`);

      // Initialize Twitter service
      await this.initializeTwitterService(trigger.agentId);

      // Execute the function using OpenAI function calling
      console.log(`[Trigger] Executing trigger function: ${trigger.functionName}`);
      
      // Get agent tools and trigger tool
      const agentTools = await this.getAgentTools();
      const triggerTool = await this.getTriggerTool(trigger.functionName);
      const tools = [...agentTools, triggerTool];
      
      // Execute with AI
      const result = await this.openAIService.executeWithAI(trigger, tools);
      
      // Update the trigger's last run and next run times
      await this.updateTriggerSchedule(trigger);
      
      // Calculate execution time
      const executionTime = Date.now() - startTime;
      
      // Prepare conversation data
      const conversationData = this.openAIService.prepareConversationData(result);
      
      // Prepare function data
      const functionData = {
        name: trigger.functionName,
        result: result,
        executedAt: new Date().toISOString()
      };
      
      // Log successful execution with all relevant data
      await TriggerLogService.logSuccessfulTrigger(
        triggerData,
        this.userId,
        executionTime,
        conversationData,
        functionData
      );

      console.log(`[Trigger] Successfully processed trigger ${trigger.id}`);
      console.log(`-----------------------------------------------\n`);
    } catch (error: any) {
      console.error(`[Trigger] *** ERROR PROCESSING TRIGGER ${trigger.id} ***`);
      console.error(`[Trigger] Error type: ${error.name || 'Unknown'}`);
      console.error(`[Trigger] Error message: ${error.message}`);
      console.error(`[Trigger] Error details:`, error);
      console.error(`-----------------------------------------------\n`);
      
      // Calculate execution time
      const executionTime = Date.now() - startTime;
      
      // Log error with details
      await TriggerLogService.logFailedTrigger(
        triggerData,
        this.userId,
        error instanceof Error ? error.message : String(error),
        executionTime
      );

      // Update next run time even if there was an error
      await this.updateTriggerSchedule(trigger);
    }
  }

  /**
   * Initialize the Twitter service for the agent
   */
  private async initializeTwitterService(agentId: number): Promise<void> {
    // Get the agent's Twitter platform
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
      // Log useful details but not sensitive tokens
    });

    // Initialize Twitter service
    try {
      this.twitterService = new TwitterService(platform);
      
      // Set the Twitter service in the OpenAI service
      this.openAIService.setTwitterService(this.twitterService);
      
      console.log(`[Twitter] Successfully initialized Twitter service for agent ${agentId}`);
    } catch (error) {
      console.error(`[Twitter] Failed to initialize Twitter service for agent ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Get the function details from the database
   */
  private async getFunctionDetails(functionName: string): Promise<Function | undefined> {
    return await db.query.functionsTable.findFirst({
      where: eq(functionsTable.name, functionName),
    });
  }

  /**
   * Get all agent tools
   */
  private async getAgentTools(): Promise<FunctionTool[]> {
    // Get agent functions from database
    const agentFunctions = await db.query.functionsTable.findMany({
      where: eq(functionsTable.type, "agent"),
    });

    // Convert to tools format
    return agentFunctions.map((func) => ({
      type: "function" as const,
      function: {
        name: func.name,
        description: func.description || "",
        parameters: func.parameters || {},
      },
    }));
  }

  /**
   * Get trigger tool
   */
  private async getTriggerTool(functionName: string): Promise<FunctionTool> {
    // Get the trigger function from the database
    const triggerFunction = await db.query.functionsTable.findFirst({
      where: and(
        eq(functionsTable.name, functionName),
        eq(functionsTable.type, "trigger")
      ),
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

  /**
   * Update the trigger's last run time and calculate the next run time
   */
  private async updateTriggerSchedule(trigger: AgentTrigger): Promise<void> {
    const now = new Date();

    // Calculate next run time based on interval and runEvery
    const nextRunAt = new Date(now);
    if (trigger.runEvery === "minutes") {
      nextRunAt.setMinutes(now.getMinutes() + trigger.interval);
    } else if (trigger.runEvery === "hours") {
      nextRunAt.setHours(now.getHours() + trigger.interval);
    }
    
    console.log(`Updating trigger schedule: next run at ${nextRunAt.toISOString()}`);

    // Update the trigger record
    await db
      .update(agentTriggersTable)
      .set({
        lastRunAt: now,
        nextRunAt: nextRunAt,
      })
      .where(eq(agentTriggersTable.id, trigger.id));
  }
}
