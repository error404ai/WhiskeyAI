/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/db/db";
import { Agent, type Function, agentPlatformsTable, agentTriggersTable, functionsTable } from "@/db/schema";
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

// Tool call data interface
interface ToolCallData {
  name: string;
  args: any;
  result?: any;
}

type ChatMessage = SystemMessage | UserMessage | ToolMessage | AssistantMessage;

export class TriggerSchedulerService {
  private openai: OpenAI;
  private twitterService: TwitterService | null = null;
  private userId: number = 0;
  private _isSecondExecution = false;

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
    console.log(`\n-----------------------------------------------`);
    console.log(`[Trigger] Processing trigger: ${trigger.name} (ID: ${trigger.id})`);
    console.log(`[Trigger] Agent ID: ${trigger.agentId}, Function: ${trigger.functionName}`);
    console.log(`-----------------------------------------------`);
    
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
        console.error(`[Trigger] Function ${trigger.functionName} not found in database`);
        throw new Error(`Function ${trigger.functionName} not found`);
      }
      console.log(`[Trigger] Found function details for ${trigger.functionName}`);

      // Initialize Twitter service
      await this.initializeTwitterService(trigger.agentId);

      // Execute the function using OpenAI function calling
      console.log(`[Trigger] Executing trigger function: ${trigger.functionName}`);
      const result = await this.executeWithAI(trigger);
      
      // Update the trigger's last run and next run times
      await this.updateTriggerSchedule(trigger);
      
      // Log successful execution and calculate execution time
      const executionTime = Date.now() - startTime;
      await TriggerLogService.updateLogExecutionTime(startLog.id, executionTime);
      await TriggerLogService.updateLogResponse(startLog.id, result as Record<string, unknown>);

      console.log(`[Trigger] Successfully processed trigger ${trigger.id}`);
      console.log(`-----------------------------------------------\n`);
    } catch (error: any) {
      console.error(`[Trigger] *** ERROR PROCESSING TRIGGER ${trigger.id} ***`);
      console.error(`[Trigger] Error type: ${error.name || 'Unknown'}`);
      console.error(`[Trigger] Error message: ${error.message}`);
      console.error(`[Trigger] Error details:`, error);
      console.error(`-----------------------------------------------\n`);
      
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
    console.log(`[Twitter] Initializing Twitter service for agent ${agentId}`);
    
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
   * Execute the function using OpenAI function calling
   */
  private async executeWithAI(triggerWithAgent: AgentTrigger & { agent: Agent & { user: { id: number } } }): Promise<any> {
    if (!this.twitterService) {
      console.error(`[AI] Twitter service not initialized in executeWithAI`);
      throw new Error("Twitter service not initialized");
    }

    console.log(`[AI] Starting AI execution for function: ${triggerWithAgent.functionName}`);

    // Define the agent tools (for data gathering)
    console.log(`[AI] Fetching agent tools`);
    const agentTools = await this.getAgentTools();
    console.log(`[AI] Found ${agentTools.length} agent tools`);
    
    // Define the trigger tool (the function that needs to be executed)
    console.log(`[AI] Fetching trigger tool for: ${triggerWithAgent.functionName}`);
    const triggerTool = await this.getTriggerTool(triggerWithAgent.functionName);
    console.log(`[AI] Successfully retrieved trigger tool: ${triggerWithAgent.functionName}`);
    
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
    console.log(`[AI] Prepared context for AI conversation:`, {
      agentName: context.agentName,
      triggerName: context.triggerName,
      informationSource: context.informationSource 
    });

    // Start the conversation with OpenAI
    console.log(`[AI] Starting conversation with OpenAI for function: ${triggerWithAgent.functionName}`);
    const { toolCallsData, successfulTriggerExecution } = await this.startConversation(triggerWithAgent, tools, context);
    console.log(`[AI] Completed conversation with ${toolCallsData.length} tool calls`);

    // Process the final trigger tool call
    if (toolCallsData.length > 0) {
      const lastCall = toolCallsData[toolCallsData.length - 1];
      console.log(`[AI] Last tool call was: ${lastCall.name}`);
      
      if (lastCall.name === triggerWithAgent.functionName) {
        // Check if the trigger function was already successfully executed during the conversation
        if (successfulTriggerExecution) {
          console.log(`[AI] Trigger function ${triggerWithAgent.functionName} was already successfully executed during conversation`);
          return lastCall.result;
        }
        
        // Execute the trigger function
        console.log(`[AI] Executing trigger function: ${triggerWithAgent.functionName} with args:`, lastCall.args);
        try {
          const result = await this.executeTriggerFunction(triggerWithAgent.functionName, lastCall.args);
          
          // Check if result is an error object (for handled errors like duplicate tweets)
          if (result && typeof result === 'object' && result.success === false && result.error) {
            console.error(`[AI] Trigger function returned error: ${result.error}`);
            await TriggerLogService.logTriggerLifecycle(
              { 
                id: triggerWithAgent.id, 
                agentId: triggerWithAgent.agentId, 
                name: triggerWithAgent.name, 
                functionName: triggerWithAgent.functionName 
              },
              this.userId,
              "Execution Error",
              {
                step: "execution_error",
                status: "error",
                message: result.error,
                requestData: lastCall.args as Record<string, unknown>,
                errorDetails: JSON.stringify(result.originalError || {}),
              }
            );
            throw new Error(result.error);
          }
          
          console.log(`[AI] Successfully executed trigger function: ${triggerWithAgent.functionName}`);
          return result;
        } catch (error) {
          console.error(`[AI] Error executing trigger function: ${triggerWithAgent.functionName}:`, error);
          throw error;
        }
      } else {
        console.error(`[AI] Expected last tool call to be ${triggerWithAgent.functionName} but was ${lastCall.name}`);
        const errorMessage = `AI did not call the expected trigger function. Expected ${triggerWithAgent.functionName} but got ${lastCall.name}`;
        
        // Log this error
        await TriggerLogService.logTriggerLifecycle(
          { 
            id: triggerWithAgent.id, 
            agentId: triggerWithAgent.agentId, 
            name: triggerWithAgent.name, 
            functionName: triggerWithAgent.functionName 
          },
          this.userId,
          "Execution Error",
          {
            step: "execution_error",
            status: "error",
            message: errorMessage,
          }
        );
        
        throw new Error(errorMessage);
      }
    } else {
      console.error(`[AI] No tool calls were made during the conversation`);
      const errorMessage = "AI did not make any tool calls during the conversation";
      
      // Log this error
      await TriggerLogService.logTriggerLifecycle(
        { 
          id: triggerWithAgent.id, 
          agentId: triggerWithAgent.agentId, 
          name: triggerWithAgent.name, 
          functionName: triggerWithAgent.functionName 
        },
        this.userId,
        "Execution Error",
        {
          step: "execution_error",
          status: "error",
          message: errorMessage,
        }
      );
      
      throw new Error(errorMessage);
    }
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
  ): Promise<{ toolCallsData: ToolCallData[]; successfulTriggerExecution: boolean }> {
    console.log(`[Conv] Starting OpenAI conversation for trigger: ${triggerWithAgent.name}`);
    
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
        
        IMPORTANT: If you encounter a rate limit error or any other error when fetching data, 
        proceed with the best information you have available. If a function call fails, simply
        try to complete the task with the available information. If not possible to proceed then exit.
        
        if post tweet, Each tweet must be unique and cannot be the same as previous tweets.
        
        First, call any agent functions needed to gather information, then call the trigger function with the appropriate arguments.`,
      },
      {
        role: "user",
        content: `Please help execute the '${triggerWithAgent.functionName}' trigger for agent '${context.agentName}'. 
        Make sure to gather any necessary information using agent functions before calling the trigger function.`,
      },
    ];
    console.log(`[Conv] Initialized conversation with system and user prompts`);

    // Track all tool calls
    const toolCallsData: ToolCallData[] = [];
    let keepConversation = true;
    
    // Track if the trigger function was successfully executed
    let successfulTriggerExecution = false;
    
    // Track conversation errors
    let conversationError = false;
    let errorCount = 0;
    const MAX_ERRORS = 3;
    
    // Continue conversation until all tool calls are processed
    let conversationTurn = 0;
    while (keepConversation && !conversationError) {
      conversationTurn++;
      console.log(`[Conv] Processing conversation turn ${conversationTurn}`);
      
      try {
        // Call OpenAI with current conversation history
        console.log(`[Conv] Sending request to OpenAI API`);
        const response = await this.openai.chat.completions.create({
          model: "gpt-4-turbo",
          messages: conversationHistory,
          tools: tools,
          tool_choice: "auto",
        });
        console.log(`[Conv] Received response from OpenAI API`);

        // Get the response message
        const responseMessage = response.choices[0].message;
        console.log(`[Conv] AI response:`, {
          hasContent: !!responseMessage.content,
          contentPreview: responseMessage.content ? responseMessage.content.substring(0, 50) + '...' : null,
          hasToolCalls: !!responseMessage.tool_calls,
          toolCallCount: responseMessage.tool_calls?.length || 0
        });
        
        // Add the AI response to the conversation history
        conversationHistory.push({
          role: responseMessage.role,
          content: responseMessage.content || "",
          tool_calls: responseMessage.tool_calls,
        } as AssistantMessage);

        // Process tool calls
        if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
          console.log(`[Conv] Processing ${responseMessage.tool_calls.length} tool calls`);
          
          // Process each tool call
          for (const toolCall of responseMessage.tool_calls) {
            console.log(`[Conv] Processing tool call: ${toolCall.function.name}`);
            
            try {
              // Parse arguments
              let args;
              try {
                args = JSON.parse(toolCall.function.arguments);
                console.log(`[Conv] Parsed arguments for ${toolCall.function.name}:`, args);
              } catch (parseError: any) {
                console.error(`[Conv] Error parsing arguments for tool call ${toolCall.function.name}:`, parseError);
                console.error(`[Conv] Raw arguments: ${toolCall.function.arguments}`);
                throw new Error(`Failed to parse arguments: ${parseError.message}`);
              }
              
              // Execute the function
              console.log(`[Conv] Executing function: ${toolCall.function.name}`);
              const result = await this.executeFunctionByName(toolCall.function.name, args);
              
              // Check if result is an error object (for handled errors like duplicate tweets)
              if (result && typeof result === 'object' && result.success === false && result.error) {
                console.warn(`[Conv] Function ${toolCall.function.name} returned handled error: ${result.error}`);
                
                // Log the error but don't throw - allow the conversation to continue
                await TriggerLogService.logTriggerLifecycle(
                  { 
                    id: triggerWithAgent.id, 
                    agentId: triggerWithAgent.agentId, 
                    name: triggerWithAgent.name, 
                    functionName: triggerWithAgent.functionName 
                  },
                  this.userId,
                  "Tool Call Warning",
                  {
                    step: `tool_call_warning_${toolCall.function.name}`,
                    status: "warning",
                    message: `Warning executing tool call: ${toolCall.function.name} - ${result.error}`,
                    requestData: args as Record<string, unknown>,
                  }
                );
                
                // Add the error response to the conversation so AI can try something else
                const toolMessage: ToolMessage = {
                  role: "tool",
                  tool_call_id: toolCall.id,
                  content: JSON.stringify({ error: result.error }),
                };
                
                conversationHistory.push(toolMessage);
                console.log(`[Conv] Added error result to conversation to let AI try again`);
                
                // Record the tool call with error result
                toolCallsData.push({ name: toolCall.function.name, args, result });
                
                continue; // Skip to the next tool call
              }
              
              console.log(`[Conv] Function executed successfully: ${toolCall.function.name}`);
              
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
                
                // Mark that the trigger function was successfully executed
                successfulTriggerExecution = true;
              }
              
              // Record the tool call with its result
              toolCallsData.push({ name: toolCall.function.name, args, result });
              
              // Add the function response to the conversation
              const toolMessage: ToolMessage = {
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify(result),
              };
              
              conversationHistory.push(toolMessage);
              console.log(`[Conv] Added function result to conversation`);
              
              // If this was the trigger function, end the conversation
              if (toolCall.function.name === triggerWithAgent.functionName) {
                console.log(`[Conv] Found trigger function call, ending conversation`);
                keepConversation = false;
              }
            } catch (err) {
              errorCount++;
              const error = err as Error;
              console.error(`[Conv] Error executing function ${toolCall.function.name}:`, error);
              
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
              
              // If this is a rate limit error or another non-fatal error, let the conversation continue
              const isRateLimitError = error.message.includes('429') || error.message.includes('rate limit');
              const isTriggerFunction = toolCall.function.name === triggerWithAgent.functionName;
              
              // For critical errors on the trigger function or too many errors, end the conversation
              if ((isTriggerFunction || errorCount >= MAX_ERRORS) && !isRateLimitError) {
                conversationError = true;
                console.error(`[Conv] Critical error encountered, ending conversation`);
                break;
              }
              
              // Add error response to the conversation
              const toolMessage: ToolMessage = {
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify({ 
                  error: `Error: ${error.message}`,
                  // Provide guidance to the AI on how to proceed
                  guidance: isRateLimitError ? 
                    "Rate limit reached. Please continue with available information or try a different approach." :
                    "An error occurred. Please try a different approach or parameters."
                }),
              };
              
              conversationHistory.push(toolMessage);
              console.log(`[Conv] Added error response to conversation`);
            }
          }
        } else {
          // If no tool calls, end the conversation
          keepConversation = false;
          console.log(`[Conv] AI response contained no tool calls, ending conversation`);
        }
      } catch (error: any) {
        // Handle errors in the conversation itself (like OpenAI API errors)
        console.error(`[Conv] Error in conversation:`, error);
        
        // Log the error
        await TriggerLogService.logTriggerLifecycle(
          { 
            id: triggerWithAgent.id, 
            agentId: triggerWithAgent.agentId, 
            name: triggerWithAgent.name, 
            functionName: triggerWithAgent.functionName 
          },
          this.userId,
          "Conversation Error",
          {
            step: "conversation_error",
            status: "error",
            message: `Error in conversation: ${error.message}`,
            errorDetails: error.stack,
          }
        );
        
        throw error;
      }
    }

    if (conversationError) {
      console.error(`[Conv] Conversation ended with errors after ${toolCallsData.length} tool calls`);
    } else {
      console.log(`[Conv] Conversation completed with ${toolCallsData.length} total tool calls`);
      // Log the sequence of tool calls
      toolCallsData.forEach((call, index) => {
        console.log(`[Conv] Tool call ${index + 1}: ${call.name}`);
      });
    }

    return { toolCallsData, successfulTriggerExecution };
  }

  /**
   * Execute a function by name with provided arguments
   */
  private async executeFunctionByName(functionName: string, args: any): Promise<any> {
    if (!this.twitterService) {
      console.error(`[Twitter] Twitter service not initialized before calling ${functionName}`);
      throw new Error("Twitter service not initialized");
    }

    console.log(`[Twitter] Executing function: ${functionName}`, { arguments: args });

    // For post_tweet, check if we're calling it from executeWithAI as a second execution
    // This prevents duplicate tweet errors by skipping the second call
    if (functionName === "post_tweet" && this._isSecondExecution) {
      console.log(`[Twitter] Skipping second execution of post_tweet to avoid duplicate content error`);
      return { 
        success: true, 
        message: "Tweet already sent in first execution. Skipping duplicate execution." 
      };
    }

    // Map function names to their implementations
    try {
      let result;
      switch (functionName) {
        case "get_home_timeline":
          console.log(`[Twitter] Fetching home timeline`);
          try {
            result = await this.twitterService.getHomeTimeLine();
            console.log(`[Twitter] Successfully fetched home timeline`);
            return result;
          } catch (error: any) {
            // For rate limit errors on timeline fetch, we can return an empty timeline
            // This allows the conversation to continue even if we can't get the timeline
            if (error.code === 429) {
              console.warn(`[Twitter] Rate limit exceeded when fetching timeline. Returning empty timeline.`);
              return { data: [] };
            }
            throw error;
          }
          
        case "post_tweet":
          console.log(`[Twitter] Posting tweet: "${args.text.substring(0, 30)}${args.text.length > 30 ? '...' : ''}"`);
          try {
            result = await this.twitterService.postTweet(args.text);
            console.log(`[Twitter] Successfully posted tweet`);
            return result;
          } catch (error: any) {
            // Handle duplicate content error specifically
            if (error.code === 403 && error.data?.detail?.includes('duplicate content')) {
              const errorMessage = "Cannot post duplicate tweet content. Please try with different content.";
              console.error(`[Twitter] ${errorMessage}`);
              // Return a structured error that can be handled by the caller
              return {
                success: false,
                error: errorMessage,
                code: error.code,
                originalError: error.data
              };
            }
            throw error;
          }
          
        case "reply_tweet":
          console.log(`[Twitter] Replying to tweet ${args.tweetId}`);
          try {
            result = await this.twitterService.replyTweet(args.text, args.tweetId);
            console.log(`[Twitter] Successfully replied to tweet ${args.tweetId}`);
            return result;
          } catch (error: any) {
            // Handle specific tweet reply errors
            if (error.code === 404) {
              const errorMessage = `Tweet ${args.tweetId} not found. It may have been deleted.`;
              console.error(`[Twitter] ${errorMessage}`);
              return {
                success: false,
                error: errorMessage,
                code: error.code,
                originalError: error.data
              };
            } else if (error.code === 403) {
              const errorMessage = "Not authorized to reply to this tweet. The tweet might be protected or from a user who blocked you.";
              console.error(`[Twitter] ${errorMessage}`);
              return {
                success: false,
                error: errorMessage,
                code: error.code,
                originalError: error.data
              };
            }
            throw error;
          }
          
        case "like_tweet":
          console.log(`[Twitter] Liking tweet ${args.tweetId}`);
          try {
            result = await this.twitterService.likeTweet(args.tweetId);
            console.log(`[Twitter] Successfully liked tweet ${args.tweetId}`);
            return result;
          } catch (error: any) {
            // Handle specific like tweet errors
            if (error.code === 404) {
              const errorMessage = `Tweet ${args.tweetId} not found. It may have been deleted.`;
              console.error(`[Twitter] ${errorMessage}`);
              return {
                success: false,
                error: errorMessage,
                code: error.code,
                originalError: error.data
              };
            } else if (error.code === 403 && error.data?.detail?.includes('already liked')) {
              const errorMessage = "Tweet already liked.";
              console.error(`[Twitter] ${errorMessage}`);
              return {
                success: false,
                error: errorMessage,
                code: error.code,
                originalError: error.data
              };
            }
            throw error;
          }
          
        case "quote_tweet":
          console.log(`[Twitter] Quoting tweet ${args.quotedTweetId}`);
          try {
            result = await this.twitterService.quoteTweet(args.quotedTweetId, args.comment);
            console.log(`[Twitter] Successfully quoted tweet ${args.quotedTweetId}`);
            return result;
          } catch (error: any) {
            // Handle specific quote tweet errors
            if (error.code === 404) {
              const errorMessage = `Tweet ${args.quotedTweetId} not found. It may have been deleted.`;
              console.error(`[Twitter] ${errorMessage}`);
              return {
                success: false,
                error: errorMessage,
                code: error.code,
                originalError: error.data
              };
            } else if (error.code === 403 && error.data?.detail?.includes('duplicate content')) {
              const errorMessage = "Cannot post duplicate tweet content. Please try with different content.";
              console.error(`[Twitter] ${errorMessage}`);
              return {
                success: false,
                error: errorMessage,
                code: error.code,
                originalError: error.data
              };
            }
            throw error;
          }
          
        case "retweet":
          console.log(`[Twitter] Retweeting tweet ${args.tweetId}`);
          try {
            result = await this.twitterService.reTweet(args.tweetId);
            console.log(`[Twitter] Successfully retweeted tweet ${args.tweetId}`);
            return result;
          } catch (error: any) {
            // Handle specific retweet errors
            if (error.code === 404) {
              const errorMessage = `Tweet ${args.tweetId} not found. It may have been deleted.`;
              console.error(`[Twitter] ${errorMessage}`);
              return {
                success: false,
                error: errorMessage,
                code: error.code,
                originalError: error.data
              };
            } else if (error.code === 403 && error.data?.detail?.includes('already retweeted')) {
              const errorMessage = "Tweet already retweeted.";
              console.error(`[Twitter] ${errorMessage}`);
              return {
                success: false,
                error: errorMessage,
                code: error.code,
                originalError: error.data
              };
            }
            throw error;
          }
          
        default:
          console.error(`[Twitter] Unknown function: ${functionName}`);
          throw new Error(`Unknown function: ${functionName}`);
      }
    } catch (error: any) {
      // Detailed error logging
      console.error(`[Twitter] Error executing function ${functionName}:`, {
        errorName: error.name,
        errorMessage: error.message,
        errorCode: error.code,
        errorType: error.type,
        errorData: error.data,
        errorStack: error.stack,
      });
      
      if (error.data) {
        console.error(`[Twitter] API Error Details:`, {
          detail: error.data.detail,
          title: error.data.title,
          status: error.data.status,
          type: error.data.type
        });
      }
      
      // Rethrow the error for the caller to handle
      throw error;
    }
  }

  /**
   * Execute a trigger function with provided arguments
   */
  private async executeTriggerFunction(functionName: string, args: any): Promise<any> {
    // Mark this as a second execution to avoid duplicate tweets
    this._isSecondExecution = true;
    try {
      return await this.executeFunctionByName(functionName, args);
    } finally {
      // Reset the flag after execution
      this._isSecondExecution = false;
    }
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
