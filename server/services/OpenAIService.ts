/* eslint-disable @typescript-eslint/no-explicit-any */
import { Agent } from "@/server/db/schema";
import { AgentTrigger } from "@/server/db/schema/agentTriggersTable";
import { OpenAI } from "openai";
import { TriggerLogService } from "./agent/TriggerLogService";
import { FunctionCallService } from "./FunctionCallService";
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
  private functionCallService: FunctionCallService;
  private model: string;

  constructor() {
    this.functionCallService = new FunctionCallService();
    this.model = process.env.MODEL!;
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
    });
  }

  public setTwitterService(twitterService: TwitterService): void {
    this.functionCallService.setTwitterService(twitterService);
  }

  public async executeWithAI(triggerWithAgent: AgentTrigger & { agent: Agent & { user: { id: number } } }, tools: FunctionTool[]): Promise<any> {
    console.log(`[AI] Starting AI execution for function: ${triggerWithAgent.functionName}`);

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
              triggerWithAgent.agent.user.id,
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
          triggerWithAgent.agent.user.id,
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
        triggerWithAgent.agent.user.id,
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

  private async startConversation(triggerWithAgent: AgentTrigger & { agent: Agent & { user: { id: number } } }, tools: FunctionTool[], context: Record<string, string>): Promise<{ toolCallsData: ToolCallData[]; successfulTriggerExecution: boolean }> {
    console.log(`[Conv] Starting OpenAI conversation for trigger: ${triggerWithAgent.name}`);
    const conversationHistory: ChatMessage[] = [
      {
        role: "system",
        content: `You are an AI assistant helping to manage a Twitter account. 
        The agent has a specific goal and description, and you need to help execute a trigger function.
        
        Agent information:
        Name: ${context.agentName}
        Goal: ${context.agentGoal}
        Description: ${context.agentDescription}
        
        Trigger information:
        Name: ${context.triggerName}
        Description: ${context.triggerDescription}
        Information Source: ${context.informationSource}
        
        You can call nessaray tools / functions to gather information before executing the trigger function.
        The trigger function to execute is: ${triggerWithAgent.functionName}
        
        IMPORTANT: Tweet length should not exceed 250 characters. If you encounter a error or any other error , 
        proceed with the best information you have available. If a function call fails, simply
        try to complete the task with the available information. If not possible to proceed then exit.
        
        First, call functions or tools needed to gather information, must follow agent description, goal, trigger description and call appropriate function to retrive data, then call the trigger function with the appropriate arguments. Trigger function is final function to execute.`,
      },
      {
        role: "user",
        content: `Please help execute the '${triggerWithAgent.functionName}'. If you need to gather any information for calling the '${triggerWithAgent.functionName}' function, Make sure to gather any necessary information using tools functions before calling the trigger function.`,
      },
    ];
    console.log(`[Conv] Initialized conversation with system and user prompts`);

    const toolCallsData: ToolCallData[] = [];
    let keepConversation = true;

    let successfulTriggerExecution = false;

    let conversationError = false;
    let errorCount = 0;
    const MAX_ERRORS = 3;

    let conversationTurn = 0;
    while (keepConversation && !conversationError) {
      conversationTurn++;
      console.log(`[Conv] Processing conversation turn ${conversationTurn}`);

      try {
        console.log(`[Conv] Sending request to OpenAI API`);
        const response = await this.openai.chat.completions.create({
          model: this.model,
          messages: conversationHistory,
          tools: tools,
          tool_choice: "auto",
        });
        console.log(`[Conv] Received response from OpenAI API`);

        const responseMessage = response.choices[0].message;
        console.log(`[Conv] AI response:`, {
          hasContent: !!responseMessage.content,
          contentPreview: responseMessage.content ? responseMessage.content.substring(0, 50) + "..." : null,
          hasToolCalls: !!responseMessage.tool_calls,
          toolCallCount: responseMessage.tool_calls?.length || 0,
        });

        conversationHistory.push({
          role: responseMessage.role,
          content: responseMessage.content || "",
          tool_calls: responseMessage.tool_calls,
        } as AssistantMessage);

        if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
          console.log(`[Conv] Processing ${responseMessage.tool_calls.length} tool calls`);

          for (const toolCall of responseMessage.tool_calls) {
            console.log(`[Conv] Processing tool call: ${toolCall.function.name}`);

            try {
              let args;
              try {
                args = JSON.parse(toolCall.function.arguments);
                console.log(`[Conv] Parsed arguments for ${toolCall.function.name}:`, args);
              } catch (parseError: any) {
                console.error(`[Conv] Error parsing arguments for tool call ${toolCall.function.name}:`, parseError);
                console.error(`[Conv] Raw arguments: ${toolCall.function.arguments}`);
                throw new Error(`Failed to parse arguments: ${parseError.message}`);
              }

              console.log(`[Conv] Executing function: ${toolCall.function.name}`);
              const result = await this.functionCallService.executeFunctionByName(toolCall.function.name, args);

              if (result && typeof result === "object" && result.success === false && result.error) {
                console.warn(`[Conv] Function ${toolCall.function.name} returned handled error: ${result.error}`);

                await TriggerLogService.logTriggerLifecycle(
                  {
                    id: triggerWithAgent.id,
                    agentId: triggerWithAgent.agentId,
                    name: triggerWithAgent.name,
                    functionName: triggerWithAgent.functionName,
                  },
                  triggerWithAgent.agent.user.id,
                  "Tool Call Warning",
                  {
                    step: `tool_call_warning_${toolCall.function.name}`,
                    status: "warning",
                    message: `Warning executing tool call: ${toolCall.function.name} - ${result.error}`,
                    requestData: args as Record<string, unknown>,
                  },
                );

                const toolMessage: ToolMessage = {
                  role: "tool",
                  tool_call_id: toolCall.id,
                  content: JSON.stringify({ error: result.error }),
                };

                conversationHistory.push(toolMessage);
                console.log(`[Conv] Added error result to conversation to let AI try again`);

                toolCallsData.push({ name: toolCall.function.name, args, result });

                continue;
              }

              console.log(`[Conv] Function executed successfully: ${toolCall.function.name}`);

              if (toolCall.function.name === triggerWithAgent.functionName) {
                await TriggerLogService.logTriggerLifecycle(
                  {
                    id: triggerWithAgent.id,
                    agentId: triggerWithAgent.agentId,
                    name: triggerWithAgent.name,
                    functionName: triggerWithAgent.functionName,
                  },
                  triggerWithAgent.agent.user.id,
                  "Trigger Function Called",
                  {
                    step: "trigger_function_called",
                    status: "success",
                    message: `AI called trigger function: ${triggerWithAgent.functionName}`,
                    requestData: args as Record<string, unknown>,
                  },
                );

                successfulTriggerExecution = true;
              }

              toolCallsData.push({ name: toolCall.function.name, args, result });

              const toolMessage: ToolMessage = {
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify(result),
              };

              conversationHistory.push(toolMessage);
              console.log(`[Conv] Added function result to conversation`);

              if (toolCall.function.name === triggerWithAgent.functionName) {
                console.log(`[Conv] Found trigger function call, ending conversation`);
                keepConversation = false;
              }
            } catch (err) {
              errorCount++;
              const error = err as Error;
              console.error(`[Conv] Error executing function ${toolCall.function.name}:`, error);

              await TriggerLogService.logTriggerLifecycle(
                {
                  id: triggerWithAgent.id,
                  agentId: triggerWithAgent.agentId,
                  name: triggerWithAgent.name,
                  functionName: triggerWithAgent.functionName,
                },
                triggerWithAgent.agent.user.id,
                "Tool Call Error",
                {
                  step: `tool_call_error_${toolCall.function.name}`,
                  status: "error",
                  message: `Error executing tool call: ${toolCall.function.name}`,
                  errorDetails: error.message,
                },
              );

              const isRateLimitError = error.message.includes("429") || error.message.includes("rate limit");
              const isTriggerFunction = toolCall.function.name === triggerWithAgent.functionName;

              // For critical errors on the trigger function or too many errors, end the conversation
              if ((isTriggerFunction || errorCount >= MAX_ERRORS) && !isRateLimitError) {
                conversationError = true;
                console.error(`[Conv] Critical error encountered, ending conversation`);
                break;
              }

              const toolMessage: ToolMessage = {
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify({
                  error: `Error: ${error.message}`,
                  guidance: isRateLimitError ? "Rate limit reached. Please continue with available information or try a different approach." : "An error occurred. Please try a different approach or parameters.",
                }),
              };

              conversationHistory.push(toolMessage);
              console.log(`[Conv] Added error response to conversation`);
            }
          }
        } else {
          keepConversation = false;
          console.log(`[Conv] AI response contained no tool calls, ending conversation`);
        }
      } catch (error: any) {
        console.error(`[Conv] Error in conversation:`, error);

        await TriggerLogService.logTriggerLifecycle(
          {
            id: triggerWithAgent.id,
            agentId: triggerWithAgent.agentId,
            name: triggerWithAgent.name,
            functionName: triggerWithAgent.functionName,
          },
          triggerWithAgent.agent.user.id,
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
      toolCallsData.forEach((call, index) => {
        console.log(`[Conv] Tool call ${index + 1}: ${call.name}`);
      });
    }

    return { toolCallsData, successfulTriggerExecution };
  }

  private async executeTriggerFunction(functionName: string, args: any): Promise<any> {
    try {
      return await this.functionCallService.executeFunctionByName(functionName, args);
    } finally {
    }
  }

  public prepareConversationData(result: any): Record<string, unknown> {
    try {
      if (result && result.conversation) {
        return {
          messages: result.conversation.messages || [],
          toolCalls: result.conversation.toolCalls || [],
        };
      }

      if (result && Array.isArray(result.messages)) {
        return {
          messages: result.messages,
          toolCalls: result.toolCalls || [],
        };
      }
      return {
        result: result,
        note: "Unable to extract structured conversation data",
      };
    } catch (error) {
      console.error("Error preparing conversation data:", error);
      return {
        error: "Failed to extract conversation data",
        rawResult: JSON.stringify(result).substring(0, 1000) + "...",
      };
    }
  }
}
