import { db } from "@/db/db";
import { NewTriggerLog, TriggerLog, triggerLogsTable } from "@/db/schema/triggerLogsTable";
import { DrizzlePaginator, PaginationResult } from "@skmirajbn/drizzle-paginator";
import { desc, eq } from "drizzle-orm";
import AuthService from "../auth/authService";
// import { DrizzlePaginatorService, PaginationResult } from "../pagination/DrizzlePaginatorService";

/**
 * Interface for filtered log parameters
 */
// interface FilteredLogsParams {
//   userId: number;
//   agentIds?: number[];
//   status?: string;
//   functionName?: string;
//   searchTerm?: string;
//   fromDate?: Date;
//   page?: number;
//   perPage?: number;
//   sortColumn?: string;
//   sortOrder?: "asc" | "desc";
// }

export class TriggerLogService {
  static async getUserTriggerLogs({ perPage = 10, page = 1 }: PaginatedProps): Promise<PaginationResult<TriggerLog>> {
    const authUser = await AuthService.getAuthUser();

    if (!authUser || !authUser.id) {
      throw new Error("Authentication required to access trigger logs");
    }

    // Convert the string ID to a number
    const userId = parseInt(authUser.id, 10);

    // Build a filtered query using Drizzle's query builder
    const query = db.query.triggerLogsTable.findMany({
      where: eq(triggerLogsTable.userId, userId),
      with: {
        agent: true,
        trigger: true,
      },
    });

    // Create paginator with the query
    const paginator = new DrizzlePaginator<TriggerLog>(db, query).page(page).allowColumns(["id", "user_id", "agent_id", "function_name", "status", "error_details"]);

    // Set ordering
    paginator.orderBy("id", "desc");

    paginator.map((item) => {
      console.log("agent is", item.agent);
      return {
        ...item,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        agentName: item.agent ? (item.agent as any)[3] : "Unknown",
      };
    });

    return paginator.paginate(perPage);
  }

  static async createLog(logData: NewTriggerLog): Promise<TriggerLog> {
    try {
      const [result] = await db.insert(triggerLogsTable).values(logData).returning();
      return result;
    } catch (error) {
      console.error("Error creating log entry:", error);
      throw error;
    }
  }

  /**
   * Get logs for a specific trigger
   */
  static async getLogsByTriggerId(triggerId: number, limit = 100): Promise<TriggerLog[]> {
    return await db.select().from(triggerLogsTable).where(eq(triggerLogsTable.triggerId, triggerId)).orderBy(desc(triggerLogsTable.createdAt)).limit(limit);
  }

  /**
   * Get logs for a specific agent
   */
  static async getLogsByAgentId(agentId: number, limit = 100): Promise<TriggerLog[]> {
    return await db.select().from(triggerLogsTable).where(eq(triggerLogsTable.agentId, agentId)).orderBy(desc(triggerLogsTable.createdAt)).limit(limit);
  }

  /**
   * Get logs for a specific user
   */
  static async getLogsByUserId(userId: number, limit = 100): Promise<TriggerLog[]> {
    return await db.select().from(triggerLogsTable).where(eq(triggerLogsTable.userId, userId)).orderBy(desc(triggerLogsTable.createdAt)).limit(limit);
  }

  /**
   * Log a successful trigger execution with conversation and function data
   */
  static async logSuccessfulTrigger(trigger: { id: number; agentId: number; name: string; functionName: string }, userId: number, executionTime?: number, conversationData?: Record<string, unknown>, functionData?: Record<string, unknown>, metadata?: Record<string, unknown>): Promise<TriggerLog> {
    const logData: NewTriggerLog = {
      triggerId: trigger.id,
      agentId: trigger.agentId,
      userId,
      functionName: trigger.functionName,
      status: "success",
      executionTime: executionTime || null,
      conversationData: conversationData || null,
      functionData: functionData || null,
      metadata,
    };

    return await this.createLog(logData);
  }

  /**
   * Log a failed trigger execution with error details
   */
  static async logFailedTrigger(trigger: { id: number; agentId: number; name: string; functionName: string }, userId: number, errorDetails: string, executionTime?: number, conversationData?: Record<string, unknown>, functionData?: Record<string, unknown>, metadata?: Record<string, unknown>): Promise<TriggerLog> {
    const logData: NewTriggerLog = {
      triggerId: trigger.id,
      agentId: trigger.agentId,
      userId,
      functionName: trigger.functionName,
      status: "error",
      executionTime: executionTime || null,
      errorDetails,
      conversationData: conversationData || null,
      functionData: functionData || null,
      metadata,
    };

    return await this.createLog(logData);
  }

  /**
   * Log when no triggers are found to process
   */
  static async logNoTriggersFound(userId: number, metadata?: Record<string, unknown>): Promise<TriggerLog> {
    const logData: NewTriggerLog = {
      userId,
      agentId: null,
      triggerId: null,
      functionName: "processPendingTriggers",
      status: "no_trigger",
      metadata,
    };

    return await this.createLog(logData);
  }

  /**
   * Update a log entry with execution time
   */
  static async updateLogExecutionTime(logId: number, executionTime: number): Promise<void> {
    await db.update(triggerLogsTable).set({ executionTime }).where(eq(triggerLogsTable.id, logId));
  }

  /**
   * Update a log entry with conversation data
   */
  static async updateConversationData(logId: number, conversationData: Record<string, unknown>): Promise<void> {
    await db.update(triggerLogsTable).set({ conversationData }).where(eq(triggerLogsTable.id, logId));
  }

  /**
   * Update a log entry with function data
   */
  static async updateFunctionData(logId: number, functionData: Record<string, unknown>): Promise<void> {
    await db.update(triggerLogsTable).set({ functionData }).where(eq(triggerLogsTable.id, logId));
  }

  /**
   * Update a log entry with error details
   */
  static async updateLogError(logId: number, errorDetails: string): Promise<void> {
    await db
      .update(triggerLogsTable)
      .set({
        errorDetails,
        status: "error",
      })
      .where(eq(triggerLogsTable.id, logId));
  }

  /**
   * Helper function to log the entire lifecycle of a trigger execution (for backward compatibility)
   */
  static async logTriggerLifecycle(
    trigger: { id: number; agentId: number; name: string; functionName: string },
    userId: number,
    action: string,
    details: {
      step: string;
      status: string;
      message?: string;
      requestData?: Record<string, unknown>;
      responseData?: Record<string, unknown>;
      errorDetails?: string;
      metadata?: Record<string, unknown>;
    },
  ): Promise<TriggerLog> {
    // Map old format to new format
    if (details.status === "error" || details.step.includes("error")) {
      return await this.logFailedTrigger(
        trigger,
        userId,
        details.errorDetails || details.message || `Error: ${action}`,
        undefined,
        { step: details.step },
        {
          request: details.requestData || null,
          response: details.responseData || null,
        },
        details.metadata,
      );
    } else if (details.status === "success" || details.step === "execution_complete") {
      return await this.logSuccessfulTrigger(
        trigger,
        userId,
        undefined,
        { step: details.step },
        {
          request: details.requestData || null,
          response: details.responseData || null,
        },
        details.metadata,
      );
    } else {
      // For "pending" status or other non-final steps, just log with status
      const logData: NewTriggerLog = {
        triggerId: trigger.id,
        agentId: trigger.agentId,
        userId,
        functionName: trigger.functionName,
        status: details.status === "pending" ? "no_trigger" : details.status,
        metadata: {
          step: details.step,
          message: details.message || `${action} - ${trigger.name}`,
          ...details.metadata,
        },
      };

      return await this.createLog(logData);
    }
  }
}
