/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/db/db";
import { Agent, Function, agentPlatformsTable, agentTriggersTable, functionsTable } from "@/db/schema";
import { AgentTrigger } from "@/db/schema/agentTriggersTable";
import TwitterService from "@/http/services/TwitterService";
import { and, eq, lte } from "drizzle-orm";
import { OpenAI } from "openai";
import { TriggerLogService } from "./TriggerLogService";

// Define OpenAI function calling interfaces
interface FunctionTool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
}

// Define types for OpenAI messages
interface SystemMessage {
  role: "system";
  content: string;
}

interface UserMessage {
  role: "user";
  content: string;
}

interface ToolMessage {
  role: "tool";
  tool_call_id: string;
  content: string;
}

interface AssistantMessage {
  role: "assistant";
  content: string | null;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

type ChatMessage = SystemMessage | UserMessage | ToolMessage | AssistantMessage;

export class TriggerSchedulerService {
  private openai: OpenAI;
  private twitterService: TwitterService | null = null;
  private userId: number = 0;

  constructor() {
    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Main method to process all pending triggers
   * This will be called from the cron job
   */
  public async processPendingTriggers(): Promise<void> {
    try {
      // Log process starting
      console.log("Starting to process pending triggers");
      
      // Get all triggers that need to be processed
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
      
      // Log critical errors to database
      await TriggerLogService.logTriggerLifecycle(
        { id: 0, agentId: 0, name: "System", functionName: "processPendingTriggers" },
        this.userId,
        "Error",
        {
          step: "error",
          status: "error",
          message: "Error processing pending triggers",
          errorDetails: error instanceof Error ? error.message : String(error),
        }
      );
    }
  }

  /**
   * Get all triggers that are due to be executed
   */
  private async getPendingTriggers() {
    const now = new Date();

    return await db.query.agentTriggersTable.findMany({
      where: and(eq(agentTriggersTable.status, "active"), lte(agentTriggersTable.nextRunAt || new Date(0), now)),
      with: {
        agent: {
          with: {
            user: true
          }
        },
      },
    });
  }

  /**
   * Process a single trigger
   */
  private async processTrigger(trigger: AgentTrigger & { agent: Agent & { user: { id: number } } }): Promise<void> {
    // Set the userId from the agent's user
    this.userId = trigger.agent.user.id;
    
    // Start the execution timer
    const startTime = Date.now();
    const triggerData = { 
      id: trigger.id, 
      agentId: trigger.agentId, 
      name: trigger.name, 
      functionName: trigger.functionName 
    };
    
    // Log trigger start
    console.log(`Processing trigger: ${trigger.name} (ID: ${trigger.id})`);
    const startLog = await TriggerLogService.logTriggerLifecycle(
      triggerData,
      this.userId,
      "Starting",
      {
        step: "init",
        status: "pending",
        message: `Starting to process trigger: ${trigger.name}`,
      }
    );
    
    try {
      // Get function details
      const functionDetails = await this.getFunctionDetails(trigger.functionName);
      if (!functionDetails) {
        throw new Error(`Function ${trigger.functionName} not found`);
      }

      // Initialize Twitter service
      await this.initializeTwitterService(trigger.agentId);

      // Execute the function using OpenAI function calling
      console.log(`Executing trigger function: ${trigger.functionName}`);
      const result = await this.executeWithAI(trigger);
      
      // Update the trigger's last run and next run times
      await this.updateTriggerSchedule(trigger);
      
      // Log successful execution and calculate execution time
      const executionTime = Date.now() - startTime;
      await TriggerLogService.updateLogExecutionTime(startLog.id, executionTime);
      await TriggerLogService.updateLogResponse(startLog.id, result as Record<string, unknown>);

      console.log(`Successfully processed trigger ${trigger.id}`);
    } catch (error) {
      console.error(`Error processing trigger ${trigger.id}:`, error);
      
      // Log error
      await TriggerLogService.updateLogError(startLog.id, error instanceof Error ? error.message : String(error));

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
      throw new Error("No enabled Twitter platform found for this agent");
    }

    // Initialize Twitter service
    this.twitterService = new TwitterService(platform);
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
   * Execute the function using OpenAI function calling
   */
  private async executeWithAI(triggerWithAgent: AgentTrigger & { agent: Agent & { user: { id: number } } }): Promise<any> {
    if (!this.twitterService) {
      throw new Error("Twitter service not initialized");
    }

    // Define the agent tools (for data gathering)
    const agentTools = await this.getAgentTools();
    
    // Define the trigger tool (the function that needs to be executed)
    const triggerTool = await this.getTriggerTool(triggerWithAgent.functionName);
    
    // Combine all tools
    const tools = [...agentTools, triggerTool];

    // Prepare the context
    const context = {
      agentName: triggerWithAgent.agent.name,
      agentGoal: triggerWithAgent.agent.information?.goal || "",
      agentDescription: triggerWithAgent.agent.information?.description || "",
      triggerName: triggerWithAgent.name,
      triggerDescription: triggerWithAgent.description,
      informationSource: triggerWithAgent.informationSource,
    };

    // Start the conversation with OpenAI
    console.log("Starting conversation with OpenAI");
    const { toolCallsData } = await this.startConversation(triggerWithAgent, tools, context);
    console.log(`Completed conversation with ${toolCallsData.length} tool calls`);

    // Process the final trigger tool call
    if (toolCallsData.length > 0 && toolCallsData[toolCallsData.length - 1].name === triggerWithAgent.functionName) {
      const triggerArgs = toolCallsData[toolCallsData.length - 1].args;
      
      // Execute the trigger function
      console.log(`Executing trigger function: ${triggerWithAgent.functionName}`);
      return await this.executeTriggerFunction(triggerWithAgent.functionName, triggerArgs);
    }

    throw new Error("OpenAI did not call the trigger function as expected");
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
   * Start conversation with OpenAI and handle multiple tool calls
   */
  private async startConversation(
    triggerWithAgent: AgentTrigger & { agent: Agent & { user: { id: number } } },
    tools: FunctionTool[],
    context: Record<string, string>
  ): Promise<{ toolCallsData: { name: string; args: any }[] }> {
    // Initialize conversation
    const conversationHistory: ChatMessage[] = [
      {
        role: "system",
        content: `You are an AI assistant helping to manage a Twitter account for an agent. 
        The agent has a specific goal and description, and you need to help execute a trigger function.
        
        Agent information:
        Name: ${context.agentName}
        Goal: ${context.agentGoal}
        Description: ${context.agentDescription}
        
        Trigger information:
        Name: ${context.triggerName}
        Description: ${context.triggerDescription}
        Information Source: ${context.informationSource}
        
        You can call agent functions to gather information before executing the trigger function.
        The trigger function to execute is: ${triggerWithAgent.functionName}
        
        First, call any agent functions needed to gather information, then call the trigger function with the appropriate arguments.`,
      },
      {
        role: "user",
        content: `Please help execute the '${triggerWithAgent.functionName}' trigger for agent '${context.agentName}'. 
        Make sure to gather any necessary information using agent functions before calling the trigger function.`,
      },
    ];

    // Track all tool calls
    const toolCallsData: { name: string; args: any }[] = [];
    let keepConversation = true;
    
    // Continue conversation until all tool calls are processed
    let conversationTurn = 0;
    while (keepConversation) {
      conversationTurn++;
      console.log(`Processing conversation turn ${conversationTurn}`);
      
      // Call OpenAI with current conversation history
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: conversationHistory,
        tools: tools,
        tool_choice: "auto",
      });

      // Get the response message
      const responseMessage = response.choices[0].message;
      
      // Add the AI response to the conversation history
      conversationHistory.push({
        role: responseMessage.role,
        content: responseMessage.content || "",
        tool_calls: responseMessage.tool_calls,
      } as AssistantMessage);

      // Process tool calls
      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        console.log(`Processing ${responseMessage.tool_calls.length} tool calls`);
        
        // Process each tool call
        for (const toolCall of responseMessage.tool_calls) {
          try {
            // Parse arguments
            const args = JSON.parse(toolCall.function.arguments);
            console.log(`Executing tool call: ${toolCall.function.name}`);
            
            // Execute the function
            const result = await this.executeFunctionByName(toolCall.function.name, args);
            
            // Log important function calls to database
            if (toolCall.function.name === triggerWithAgent.functionName) {
              await TriggerLogService.logTriggerLifecycle(
                { 
                  id: triggerWithAgent.id, 
                  agentId: triggerWithAgent.agentId, 
                  name: triggerWithAgent.name, 
                  functionName: triggerWithAgent.functionName 
                },
                this.userId,
                "Trigger Function Called",
                {
                  step: "trigger_function_called",
                  status: "success",
                  message: `AI called trigger function: ${triggerWithAgent.functionName}`,
                  requestData: args as Record<string, unknown>,
                }
              );
            }
            
            // Record the tool call
            toolCallsData.push({ name: toolCall.function.name, args });
            
            // Add the function response to the conversation
            const toolMessage: ToolMessage = {
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify(result),
            };
            
            conversationHistory.push(toolMessage);
            
            // If this was the trigger function, end the conversation
            if (toolCall.function.name === triggerWithAgent.functionName) {
              keepConversation = false;
            }
          } catch (err) {
            const error = err as Error;
            console.error(`Error executing function ${toolCall.function.name}:`, error);
            
            // Log errors to database
            await TriggerLogService.logTriggerLifecycle(
              { 
                id: triggerWithAgent.id, 
                agentId: triggerWithAgent.agentId, 
                name: triggerWithAgent.name, 
                functionName: triggerWithAgent.functionName 
              },
              this.userId,
              "Tool Call Error",
              {
                step: `tool_call_error_${toolCall.function.name}`,
                status: "error",
                message: `Error executing tool call: ${toolCall.function.name}`,
                errorDetails: error.message,
              }
            );
            
            const toolMessage: ToolMessage = {
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify({ error: `Error: ${error.message}` }),
            };
            
            conversationHistory.push(toolMessage);
          }
        }
      } else {
        // If no tool calls, end the conversation
        keepConversation = false;
        console.log("AI response contained no tool calls");
      }
    }

    return { toolCallsData };
  }

  /**
   * Execute a function by name with provided arguments
   */
  private async executeFunctionByName(functionName: string, args: any): Promise<any> {
    if (!this.twitterService) {
      throw new Error("Twitter service not initialized");
    }

    // Map function names to their implementations
    switch (functionName) {
      case "get_home_timeline":
        return await this.twitterService.getHomeTimeLine();
      case "post_tweet":
        return await this.twitterService.postTweet(args.text);
      case "reply_tweet":
        return await this.twitterService.replyTweet(args.text, args.tweetId);
      case "like_tweet":
        return await this.twitterService.likeTweet(args.tweetId);
      case "quote_tweet":
        return await this.twitterService.quoteTweet(args.quotedTweetId, args.comment);
      case "retweet":
        return await this.twitterService.reTweet(args.tweetId);
      default:
        throw new Error(`Unknown function: ${functionName}`);
    }
  }

  /**
   * Execute a trigger function with provided arguments
   */
  private async executeTriggerFunction(functionName: string, args: any): Promise<any> {
    return await this.executeFunctionByName(functionName, args);
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
