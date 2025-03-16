import { db } from "@/db/db";
import { NewTriggerLog, TriggerLog, triggerLogsTable } from "@/db/schema/triggerLogsTable";
import { eq, and, desc } from "drizzle-orm";

/**
 * Service for managing trigger execution logs
 */
export class TriggerLogService {
  /**
   * Create a new log entry
   */
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
   * Get logs for a specific execution
   * This returns all logs with the same triggerId that were created within a short timeframe
   */
  static async getExecutionLogs(triggerId: number, timestamp: Date): Promise<TriggerLog[]> {
    // Create a date range (5 minutes before and after the timestamp)
    const startTime = new Date(timestamp);
    startTime.setMinutes(startTime.getMinutes() - 5);
    
    const endTime = new Date(timestamp);
    endTime.setMinutes(endTime.getMinutes() + 5);
    
    return await db.select().from(triggerLogsTable)
      .where(and(
        eq(triggerLogsTable.triggerId, triggerId),
        // Here you would add timestamp conditions, but that's not implemented in this example
      ))
      .orderBy(triggerLogsTable.createdAt);
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
   * Update a log entry with response data
   */
  static async updateLogResponse(logId: number, responseData: Record<string, unknown>, status = "success"): Promise<void> {
    await db
      .update(triggerLogsTable)
      .set({ 
        responseData,
        status
      })
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
   * Helper function to log the entire lifecycle of a trigger execution
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
    const logData: NewTriggerLog = {
      triggerId: trigger.id,
      agentId: trigger.agentId,
      userId,
      functionName: trigger.functionName,
      step: details.step,
      status: details.status,
      message: details.message || `${action} - ${trigger.name}`,
      requestData: details.requestData || null,
      responseData: details.responseData || null,
      errorDetails: details.errorDetails || null,
      metadata: details.metadata || null,
    };

    return await this.createLog(logData);
  }
} 