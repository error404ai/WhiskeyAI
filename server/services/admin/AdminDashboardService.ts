import { db } from "@/db/db";
import { agentsTable, scheduledTweetsTable, triggerLogsTable, usersTable } from "@/db/schema";
import { startOfDay, subMonths, subWeeks, subYears } from "date-fns";
import { SQL, count, desc, eq, gt, sql } from "drizzle-orm";

export class AdminDashboardService {
  /**
   * Get dashboard statistics for admin
   */
  static async getDashboardStats() {
    // Total users
    const [totalUsersResult] = await db.select({ count: count() }).from(usersTable);
    const totalUsers = totalUsersResult?.count || 0;

    // Total agents
    const [totalAgentsResult] = await db.select({ count: count() }).from(agentsTable);
    const totalAgents = totalAgentsResult?.count || 0;

    // Total trigger logs
    const [totalTriggersResult] = await db.select({ count: count() }).from(triggerLogsTable);
    const totalTriggers = totalTriggersResult?.count || 0;

    // Total scheduled tweets
    const [totalTweetsResult] = await db.select({ count: count() }).from(scheduledTweetsTable);
    const totalTweets = totalTweetsResult?.count || 0;

    // Active users (users who have created agents)
    const [activeUsersResult] = await db.select({ count: sql<number>`COUNT(DISTINCT ${agentsTable.userId})` }).from(agentsTable);
    const activeUsers = activeUsersResult?.count || 0;

    // Successful trigger executions
    const [successfulTriggersResult] = await db.select({ count: count() }).from(triggerLogsTable).where(eq(triggerLogsTable.status, "success"));
    const successfulTriggers = successfulTriggersResult?.count || 0;

    // Failed trigger executions
    const [failedTriggersResult] = await db.select({ count: count() }).from(triggerLogsTable).where(eq(triggerLogsTable.status, "error"));
    const failedTriggers = failedTriggersResult?.count || 0;

    // New users today
    const today = startOfDay(new Date());
    const [newUsersTodayResult] = await db.select({ count: count() }).from(usersTable).where(gt(usersTable.createdAt, today));
    const newUsersToday = newUsersTodayResult?.count || 0;

    // Paying users (only those who have paid, not including unlimited access)
    const [payingUsersResult] = await db.select({ count: count() }).from(usersTable).where(eq(usersTable.hasPaidForAgents, true));
    const payingUsers = payingUsersResult?.count || 0;

    // Unlimited access users
    const [unlimitedUsersResult] = await db.select({ count: count() }).from(usersTable).where(eq(usersTable.has_unlimited_access, true));
    const unlimitedUsers = unlimitedUsersResult?.count || 0;

    return {
      success: true,
      stats: {
        totalUsers,
        totalAgents,
        totalTriggers,
        totalTweets,
        activeUsers,
        successfulTriggers,
        failedTriggers,
        newUsersToday,
        payingUsers,
        unlimitedUsers,
        triggerSuccessRate: totalTriggers > 0 ? Math.round((successfulTriggers / totalTriggers) * 100) : 0,
        userConversionRate: totalUsers > 0 ? Math.round((payingUsers / totalUsers) * 100) : 0,
        userActivityRate: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
      },
    };
  }

  /**
   * Get recent user registrations
   */
  static async getRecentUsers(limit = 5) {
    const recentUsers = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        avatar: usersTable.avatar,
        is_active: usersTable.is_active,
        hasPaidForAgents: usersTable.hasPaidForAgents,
        has_unlimited_access: usersTable.has_unlimited_access,
        createdAt: usersTable.createdAt,
        customer_id: usersTable.customer_id,
        publicKey: usersTable.publicKey,
      })
      .from(usersTable)
      .orderBy(desc(usersTable.createdAt))
      .limit(limit);

    return {
      success: true,
      data: recentUsers,
    };
  }

  /**
   * Get recent agent creations
   */
  static async getRecentAgents(limit = 5) {
    const recentAgents = await db
      .select({
        id: agentsTable.id,
        name: agentsTable.name,
        status: agentsTable.status,
        uuid: agentsTable.uuid,
        userId: agentsTable.userId,
        userName: usersTable.name,
        userEmail: usersTable.email,
      })
      .from(agentsTable)
      .leftJoin(usersTable, eq(agentsTable.userId, usersTable.id))
      .orderBy(desc(agentsTable.id))
      .limit(limit);

    return {
      success: true,
      data: recentAgents,
    };
  }

  /**
   * Get recent trigger logs
   */
  static async getRecentTriggerLogs(limit = 5) {
    const recentLogs = await db
      .select({
        id: triggerLogsTable.id,
        functionName: triggerLogsTable.functionName,
        status: triggerLogsTable.status,
        createdAt: triggerLogsTable.createdAt,
        agentId: triggerLogsTable.agentId,
        agentName: agentsTable.name,
        userId: triggerLogsTable.userId,
        publicKey: usersTable.publicKey,
      })
      .from(triggerLogsTable)
      .leftJoin(agentsTable, eq(triggerLogsTable.agentId, agentsTable.id))
      .leftJoin(usersTable, eq(triggerLogsTable.userId, usersTable.id))
      .orderBy(desc(triggerLogsTable.createdAt))
      .limit(limit);

    return {
      success: true,
      data: recentLogs,
    };
  }

  /**
   * Get user registrations over time
   */
  static async getUserRegistrationsOverTime(period: "week" | "month" | "year" = "week") {
    const now = new Date();
    let startDate: Date;
    let intervalSql: SQL<unknown>;

    // Set the parameters based on the requested period
    if (period === "week") {
      startDate = subWeeks(now, 1);
      intervalSql = sql`date_trunc('day', ${usersTable.createdAt})`;
    } else if (period === "month") {
      startDate = subMonths(now, 1);
      intervalSql = sql`date_trunc('day', ${usersTable.createdAt})`;
    } else {
      startDate = subYears(now, 1);
      intervalSql = sql`date_trunc('month', ${usersTable.createdAt})`;
    }

    // Fetch data from the database
    const registrations = await db
      .select({
        date: intervalSql,
        count: count(),
      })
      .from(usersTable)
      .where(gt(usersTable.createdAt, startDate))
      .groupBy(intervalSql)
      .orderBy(intervalSql);

    // Transform the data into a format suitable for charts
    const formattedData = registrations.map((item) => ({
      date: new Date(item.date as string).toISOString().split("T")[0], // YYYY-MM-DD format
      count: Number(item.count),
    }));

    return {
      success: true,
      data: formattedData,
    };
  }
}
