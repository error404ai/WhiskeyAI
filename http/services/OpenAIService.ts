/* eslint-disable @typescript-eslint/no-explicit-any */
import { Agent } from "@/db/schema";
import { AgentTrigger } from "@/db/schema/agentTriggersTable";
import { OpenAI } from "openai";
import { functionEnum } from "../enum/functionEnum";
import { TriggerLogService } from "./agent/TriggerLogService";
import rpcService from "./Rpc/RpcService";
import TwitterService from "./TwitterService";

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

export class OpenAIService {
  private openai: OpenAI;
  private twitterService: TwitterService | null = null;
  private userId: number = 0;
  private _isSecondExecution = false;
  private model: string;

  constructor() {
    this.model = process.env.MODEL!;
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
    });
  }

  public setUserId(userId: number): void {
    this.userId = userId;
  }

  public setTwitterService(twitterService: TwitterService): void {
    this.twitterService = twitterService;
  }

  public async executeWithAI(triggerWithAgent: AgentTrigger & { agent: Agent & { user: { id: number } } }, tools: FunctionTool[]): Promise<any> {
    if (!this.twitterService) {
      console.error(`[AI] Twitter service not initialized in executeWithAI`);
      throw new Error("Twitter service not initialized");
    }

    console.log(`[AI] Starting AI execution for function: ${triggerWithAgent.functionName}`);

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
      informationSource: context.informationSource,
    });

    console.log(`[AI] Starting conversation with OpenAI for function: ${triggerWithAgent.functionName}`);
    const { toolCallsData, successfulTriggerExecution } = await this.startConversation(triggerWithAgent, tools, context);
    console.log(`[AI] Completed conversation with ${toolCallsData.length} tool calls`);

    if (toolCallsData.length > 0) {
      const lastCall = toolCallsData[toolCallsData.length - 1];
      console.log(`[AI] Last tool call was: ${lastCall.name}`);

      if (lastCall.name === triggerWithAgent.functionName) {
        if (successfulTriggerExecution) {
          console.log(`[AI] Trigger function ${triggerWithAgent.functionName} was already successfully executed during conversation`);
          return lastCall.result;
        }

        console.log(`[AI] Executing trigger function: ${triggerWithAgent.functionName} with args:`, lastCall.args);
        try {
          const result = await this.executeTriggerFunction(triggerWithAgent.functionName, lastCall.args);

          // Check if result is an error object (for handled errors like duplicate tweets)
          if (result && typeof result === "object" && result.success === false && result.error) {
            console.error(`[AI] Trigger function returned error: ${result.error}`);

            // Log the error using our new approach
            await TriggerLogService.logFailedTrigger(
              {
                id: triggerWithAgent.id,
                agentId: triggerWithAgent.agentId,
                name: triggerWithAgent.name,
                functionName: triggerWithAgent.functionName,
              },
              this.userId,
              result.error,
              undefined, // No execution time
              { messages: "Error occurred during function execution" }, // Minimal conversation data
              {
                request: lastCall.args,
                error: result.error,
                originalError: result.originalError || {},
              }, // Function data
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
        await TriggerLogService.logFailedTrigger(
          {
            id: triggerWithAgent.id,
            agentId: triggerWithAgent.agentId,
            name: triggerWithAgent.name,
            functionName: triggerWithAgent.functionName,
          },
          this.userId,
          errorMessage,
          undefined,
          { messages: toolCallsData.map((call) => ({ role: "function", content: call.name })) },
          { lastToolCall: lastCall },
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
          functionName: triggerWithAgent.functionName,
        },
        this.userId,
        "Execution Error",
        {
          step: "execution_error",
          status: "error",
          message: errorMessage,
        },
      );

      throw new Error(errorMessage);
    }
  }

  /**
   * Start conversation with OpenAI and handle multiple tool calls
   */
  private async startConversation(triggerWithAgent: AgentTrigger & { agent: Agent & { user: { id: number } } }, tools: FunctionTool[], context: Record<string, string>): Promise<{ toolCallsData: ToolCallData[]; successfulTriggerExecution: boolean }> {
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
        
        You can call functions to gather information before executing the trigger function.
        The trigger function to execute is: ${triggerWithAgent.functionName}
        
        IMPORTANT: If you encounter a error or any other error , 
        proceed with the best information you have available. If a function call fails, simply
        try to complete the task with the available information. If not possible to proceed then exit.
        
        First, call  functions or tools needed to gather information, then call the trigger function with the appropriate arguments. Trigger function is final function to execute.`,
      },
      {
        role: "user",
        content: `Please help execute the '${triggerWithAgent.functionName}' trigger for agent '${context.agentName}'. If you need to gather any information for calling the '${triggerWithAgent.functionName}' function, Make sure to gather any necessary information using tools functions before calling the trigger function.`,
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
          model: this.model,
          messages: conversationHistory,
          tools: tools,
          tool_choice: "auto",
        });
        console.log(`[Conv] Received response from OpenAI API`);

        // Get the response message
        const responseMessage = response.choices[0].message;
        console.log(`[Conv] AI response:`, {
          hasContent: !!responseMessage.content,
          contentPreview: responseMessage.content ? responseMessage.content.substring(0, 50) + "..." : null,
          hasToolCalls: !!responseMessage.tool_calls,
          toolCallCount: responseMessage.tool_calls?.length || 0,
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
              if (result && typeof result === "object" && result.success === false && result.error) {
                console.warn(`[Conv] Function ${toolCall.function.name} returned handled error: ${result.error}`);

                // Log the error but don't throw - allow the conversation to continue
                await TriggerLogService.logTriggerLifecycle(
                  {
                    id: triggerWithAgent.id,
                    agentId: triggerWithAgent.agentId,
                    name: triggerWithAgent.name,
                    functionName: triggerWithAgent.functionName,
                  },
                  this.userId,
                  "Tool Call Warning",
                  {
                    step: `tool_call_warning_${toolCall.function.name}`,
                    status: "warning",
                    message: `Warning executing tool call: ${toolCall.function.name} - ${result.error}`,
                    requestData: args as Record<string, unknown>,
                  },
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
                    functionName: triggerWithAgent.functionName,
                  },
                  this.userId,
                  "Trigger Function Called",
                  {
                    step: "trigger_function_called",
                    status: "success",
                    message: `AI called trigger function: ${triggerWithAgent.functionName}`,
                    requestData: args as Record<string, unknown>,
                  },
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
                  functionName: triggerWithAgent.functionName,
                },
                this.userId,
                "Tool Call Error",
                {
                  step: `tool_call_error_${toolCall.function.name}`,
                  status: "error",
                  message: `Error executing tool call: ${toolCall.function.name}`,
                  errorDetails: error.message,
                },
              );

              // If this is a rate limit error or another non-fatal error, let the conversation continue
              const isRateLimitError = error.message.includes("429") || error.message.includes("rate limit");
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
                  guidance: isRateLimitError ? "Rate limit reached. Please continue with available information or try a different approach." : "An error occurred. Please try a different approach or parameters.",
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
            functionName: triggerWithAgent.functionName,
          },
          this.userId,
          "Conversation Error",
          {
            step: "conversation_error",
            status: "error",
            message: `Error in conversation: ${error.message}`,
            errorDetails: error.stack,
          },
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
  public async executeFunctionByName(functionName: string, args: any): Promise<any> {
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
        message: "Tweet already sent in first execution. Skipping duplicate execution.",
      };
    }

    // Map function names to their implementations
    try {
      let result;
      switch (functionName) {
        case functionEnum.get_home_timeline:
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

        case functionEnum.post_tweet:
          console.log(`[Twitter] Posting tweet: "${args.text.substring(0, 30)}${args.text.length > 30 ? "..." : ""}"`);
          try {
            result = await this.twitterService.postTweet(args.text);
            console.log(`[Twitter] Successfully posted tweet`);
            return result;
          } catch (error: any) {
            // Handle duplicate content error specifically
            if (error.code === 403 && error.data?.detail?.includes("duplicate content")) {
              const errorMessage = "Cannot post duplicate tweet content. Please try with different content.";
              console.error(`[Twitter] ${errorMessage}`);
              // Return a structured error that can be handled by the caller
              return {
                success: false,
                error: errorMessage,
                code: error.code,
                originalError: error.data,
              };
            }
            throw error;
          }

        case functionEnum.reply_tweet:
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
                originalError: error.data,
              };
            } else if (error.code === 403) {
              const errorMessage = "Not authorized to reply to this tweet. The tweet might be protected or from a user who blocked you.";
              console.error(`[Twitter] ${errorMessage}`);
              return {
                success: false,
                error: errorMessage,
                code: error.code,
                originalError: error.data,
              };
            }
            throw error;
          }

        case functionEnum.like_tweet:
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
                originalError: error.data,
              };
            } else if (error.code === 403 && error.data?.detail?.includes("already liked")) {
              const errorMessage = "Tweet already liked.";
              console.error(`[Twitter] ${errorMessage}`);
              return {
                success: false,
                error: errorMessage,
                code: error.code,
                originalError: error.data,
              };
            }
            throw error;
          }

        case functionEnum.quote_tweet:
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
                originalError: error.data,
              };
            } else if (error.code === 403 && error.data?.detail?.includes("duplicate content")) {
              const errorMessage = "Cannot post duplicate tweet content. Please try with different content.";
              console.error(`[Twitter] ${errorMessage}`);
              return {
                success: false,
                error: errorMessage,
                code: error.code,
                originalError: error.data,
              };
            }
            throw error;
          }

        case functionEnum.retweet:
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
                originalError: error.data,
              };
            } else if (error.code === 403 && error.data?.detail?.includes("already retweeted")) {
              const errorMessage = "Tweet already retweeted.";
              console.error(`[Twitter] ${errorMessage}`);
              return {
                success: false,
                error: errorMessage,
                code: error.code,
                originalError: error.data,
              };
            }
            throw error;
          }

        case functionEnum.RPC_getAccountInfo:
          console.log(`[RPC] Getting account info`);
          try {
            result = await rpcService.getAccountInfo(args.publicKey);
            console.log(`[Twitter] Successfully get account info ${args.publicKey}`);
            return result;
          } catch (error: any) {
            throw error;
          }
        case functionEnum.RPC_getBalance:
          console.log(`[RPC] Getting balance`);
          try {
            result = await rpcService.getBalance(args.publicKey);
            console.log(`[Twitter] Successfully get balance ${args.publicKey}`);
            return result;
          } catch (error: any) {
            throw error;
          }
        case functionEnum.RPC_getBlock:
          console.log(`[RPC] Getting block`);
          try {
            result = await rpcService.getBlock(args.slot);
            console.log(`[Twitter] Successfully get block ${args.slot}`);
            return result;
          } catch (error: any) {
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
          type: error.data.type,
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
   * Prepare conversation data from the AI chat result
   */
  public prepareConversationData(result: any): Record<string, unknown> {
    try {
      // Try to extract conversation data
      if (result && result.conversation) {
        return {
          messages: result.conversation.messages || [],
          toolCalls: result.conversation.toolCalls || [],
        };
      }

      // If result has messages directly
      if (result && Array.isArray(result.messages)) {
        return {
          messages: result.messages,
          toolCalls: result.toolCalls || [],
        };
      }

      // Fallback
      return {
        result: result,
        note: "Unable to extract structured conversation data",
      };
    } catch (error) {
      console.error("Error preparing conversation data:", error);
      return {
        error: "Failed to extract conversation data",
        rawResult: JSON.stringify(result).substring(0, 1000) + "...", // Limited to prevent very large logs
      };
    }
  }
}
