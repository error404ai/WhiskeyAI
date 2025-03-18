import { db } from "@/db/db";
import { NewTriggerLog, TriggerLog, triggerLogsTable } from "@/db/schema/triggerLogsTable";
import { eq, desc } from "drizzle-orm";

/**
 * Service for managing trigger execution logs
 */
export class TriggerLogService {
  /**
   * Create a new log entry with duplicate protection
   */
  static async createLog(logData: NewTriggerLog): Promise<TriggerLog> {
    try {
      // If this is a trigger log (has a triggerId), check for recent duplicates
      if (logData.triggerId) {
        try {
          // Check for recent logs for this trigger (within 5 seconds)
          const recentLogs = await db.select()
            .from(triggerLogsTable)
            .where(eq(triggerLogsTable.triggerId, logData.triggerId))
            .orderBy(desc(triggerLogsTable.createdAt))
            .limit(3);
            
          // If we found a very recent log (less than 5 seconds old), don't create a new one
          const recentLog = recentLogs.find(log => 
            new Date().getTime() - new Date(log.createdAt).getTime() < 5000
          );
          
          if (recentLog) {
            console.log(`Found very recent log (${recentLog.id}) for trigger ${logData.triggerId}, avoiding duplicate`);
            return recentLog;
          }
        } catch (err) {
          // If checking for duplicates fails, just continue with creating the log
          console.error("Error checking for duplicate logs:", err);
        }
      }
      
      // Create the new log
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
    return await db.select().from(triggerLogsTable)
      .where(eq(triggerLogsTable.triggerId, triggerId))
      .orderBy(desc(triggerLogsTable.createdAt))
      .limit(limit);
  }

  /**
   * Get logs for a specific agent
   */
  static async getLogsByAgentId(agentId: number, limit = 100): Promise<TriggerLog[]> {
    return await db.select().from(triggerLogsTable)
      .where(eq(triggerLogsTable.agentId, agentId))
      .orderBy(desc(triggerLogsTable.createdAt))
      .limit(limit);
  }

  /**
   * Get logs for a specific user
   */
  static async getLogsByUserId(userId: number, limit = 100): Promise<TriggerLog[]> {
    return await db.select().from(triggerLogsTable)
      .where(eq(triggerLogsTable.userId, userId))
      .orderBy(desc(triggerLogsTable.createdAt))
      .limit(limit);
  }

  /**
   * Log a successful trigger execution with conversation and function data
   */
  static async logSuccessfulTrigger(
    trigger: { id: number; agentId: number; name: string; functionName: string },
    userId: number,
    executionTime?: number,
    conversationData?: Record<string, unknown>,
    functionData?: Record<string, unknown>,
    metadata?: Record<string, unknown>
  ): Promise<TriggerLog> {
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
  static async logFailedTrigger(
    trigger: { id: number; agentId: number; name: string; functionName: string },
    userId: number,
    errorDetails: string,
    executionTime?: number,
    conversationData?: Record<string, unknown>,
    functionData?: Record<string, unknown>,
    metadata?: Record<string, unknown>
  ): Promise<TriggerLog> {
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
  static async logNoTriggersFound(
    userId: number,
    metadata?: Record<string, unknown>
  ): Promise<TriggerLog> {
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
    await db
      .update(triggerLogsTable)
      .set({ executionTime })
      .where(eq(triggerLogsTable.id, logId));
  }

  /**
   * Update a log entry with conversation data
   */
  static async updateConversationData(logId: number, conversationData: Record<string, unknown>): Promise<void> {
    await db
      .update(triggerLogsTable)
      .set({ conversationData })
      .where(eq(triggerLogsTable.id, logId));
  }

  /**
   * Update a log entry with function data
   */
  static async updateFunctionData(logId: number, functionData: Record<string, unknown>): Promise<void> {
    await db
      .update(triggerLogsTable)
      .set({ functionData })
      .where(eq(triggerLogsTable.id, logId));
  }

  /**
   * Update a log entry with error details
   */
  static async updateLogError(logId: number, errorDetails: string): Promise<void> {
    await db
      .update(triggerLogsTable)
      .set({ 
        errorDetails,
        status: "error"
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
    }
  ): Promise<TriggerLog> {
    // Map to new format based on status
    if (details.status === "error" || details.step.includes("error")) {
      return await this.logFailedTrigger(
        trigger,
        userId,
        details.errorDetails || details.message || `Error: ${action}`,
        undefined,
        { step: details.step },
        { 
          request: details.requestData || null,
          response: details.responseData || null
        },
        details.metadata
      );
    } else if (details.status === "success" || details.step === "execution_complete") {
      return await this.logSuccessfulTrigger(
        trigger,
        userId,
        undefined,
        { step: details.step },
        { 
          request: details.requestData || null,
          response: details.responseData || null
        },
        details.metadata
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
          ...details.metadata
        }
      };

      return await this.createLog(logData);
    }
  }
} 