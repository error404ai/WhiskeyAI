import { db } from "@/db/db";
import { NewScheduledTweet, ScheduledTweet, agentPlatformsTable, agentsTable, scheduledTweetsTable } from "@/db/schema";
import { DrizzlePaginator, PaginationResult } from "@skmirajbn/drizzle-paginator";
import { and, desc, eq, lte, sql } from "drizzle-orm";
import { PaginatedProps } from "../controllers/ScheduledTweetController";
import TwitterService from "./TwitterService";
import AuthService from "./auth/authService";

export class ScheduledTweetService {
  public static async createScheduledTweet(data: NewScheduledTweet): Promise<number> {
    const [result] = await db.insert(scheduledTweetsTable).values(data).returning({ id: scheduledTweetsTable.id });
    return result.id;
  }

  public static async getScheduledBatches(params: PaginatedProps = { page: 1, perPage: 10 }): Promise<PaginationResult<ScheduledTweet>> {
    const authUser = await AuthService.getAuthUser();
    if (!authUser) {
      throw new Error("User not authenticated");
    }

    const query = db
      .select({
        batchId: scheduledTweetsTable.batchId,
        createdAt: sql`MIN(${scheduledTweetsTable.createdAt})`,
      })
      .from(scheduledTweetsTable)
      .innerJoin(agentsTable, eq(scheduledTweetsTable.agentId, agentsTable.id))
      .where(eq(agentsTable.userId, Number(authUser.id)))
      .groupBy(scheduledTweetsTable.batchId)
      .orderBy(desc(scheduledTweetsTable.batchId));

    const paginator = new DrizzlePaginator<ScheduledTweet>(db, query).page(params.page || 1).allowColumns(["batchId", "createdAt"]);

    // console.log("paginator is", (await paginator.paginate(10)).data[0].agent);
    return paginator.paginate(params.perPage || 10);
  }
  public static async getSchedulesByBatchId(params: PaginatedProps = { page: 1, perPage: 10 }, batchId: string): Promise<PaginationResult<ScheduledTweet>> {
    const authUser = await AuthService.getAuthUser();
    if (!authUser) {
      throw new Error("User not authenticated");
    }

    const query = db
      .select()
      .from(scheduledTweetsTable)
      .innerJoin(agentsTable, eq(scheduledTweetsTable.agentId, agentsTable.id))
      .where(and(eq(agentsTable.userId, Number(authUser.id)), eq(scheduledTweetsTable.batchId, batchId)));

    const paginator = new DrizzlePaginator<ScheduledTweet>(db, query).page(params.page || 1).allowColumns(["batchId", "content", "scheduledAt", "status", "processedAt", "errorMessage", "createdAt"]);

    console.log("paginator is", (await paginator.paginate(10)).data[0]);
    return paginator.paginate(params.perPage || 10);
  }

  public static async getScheduledTweets(params: PaginatedProps = { page: 1, perPage: 10 }): Promise<PaginationResult<ScheduledTweet>> {
    const authUser = await AuthService.getAuthUser();
    if (!authUser) {
      throw new Error("User not authenticated");
    }

    const query = db
      .select()
      .from(scheduledTweetsTable)
      .innerJoin(agentsTable, eq(scheduledTweetsTable.agentId, agentsTable.id))
      .where(eq(agentsTable.userId, Number(authUser.id)));

    const paginator = new DrizzlePaginator<ScheduledTweet>(db, query).page(params.page || 1).allowColumns(["batchId", "content", "scheduledAt", "status", "processedAt", "errorMessage", "createdAt"]);

    console.log("paginator is", (await paginator.paginate(10)).data[0]);
    return paginator.paginate(params.perPage || 10);
  }

  public static async getPendingScheduledTweets(): Promise<(ScheduledTweet & { agent: { uuid: string } })[]> {
    const now = new Date();

    const pendingTweets = await db.query.scheduledTweetsTable.findMany({
      where: and(eq(scheduledTweetsTable.status, "pending"), lte(scheduledTweetsTable.scheduledAt, now)),
      with: {
        agent: true,
      },
    });

    return pendingTweets.map((tweet) => ({
      ...tweet,
      agent: {
        uuid: tweet.agent.uuid,
      },
    }));
  }

  public static async processTweet(tweet: ScheduledTweet & { agent: { uuid: string } }): Promise<boolean> {
    try {
      // Get the agent platform for Twitter
      const agentPlatform = await db.query.agentPlatformsTable.findFirst({
        where: and(eq(agentPlatformsTable.agentId, tweet.agentId), eq(agentPlatformsTable.type, "twitter"), eq(agentPlatformsTable.enabled, true)),
      });

      if (!agentPlatform) {
        throw new Error(`No enabled Twitter platform found for agent ${tweet.agentId}`);
      }

      const twitterService = new TwitterService(agentPlatform);

      await twitterService.postTweet(tweet.content);

      await db
        .update(scheduledTweetsTable)
        .set({
          status: "completed",
          processedAt: new Date(),
        })
        .where(eq(scheduledTweetsTable.id, tweet.id));

      return true;
    } catch (error) {
      await db
        .update(scheduledTweetsTable)
        .set({
          status: "failed",
          processedAt: new Date(),
          errorMessage: error instanceof Error ? error.message : String(error),
        })
        .where(eq(scheduledTweetsTable.id, tweet.id));

      return false;
    }
  }

  public static async deleteScheduledTweet(tweetId: number): Promise<boolean> {
    const authUser = await AuthService.getAuthUser();
    if (!authUser) {
      throw new Error("User not authenticated");
    }

    // First verify the tweet belongs to the user
    const tweet = await db.query.scheduledTweetsTable.findFirst({
      where: eq(scheduledTweetsTable.id, tweetId),
      with: {
        agent: true,
      },
    });

    if (!tweet || !tweet.agent || tweet.agent.userId !== Number(authUser.id)) {
      throw new Error("Tweet not found or not owned by user");
    }

    // Only allow cancelling if the tweet is pending
    if (tweet.status !== "pending") {
      throw new Error("Only pending tweets can be cancelled");
    }

    // Update tweet status to cancelled instead of deleting
    await db
      .update(scheduledTweetsTable)
      .set({
        status: "cancelled",
        processedAt: new Date(),
      })
      .where(eq(scheduledTweetsTable.id, tweetId));

    return true;
  }

  public static async cancelBatchTweets(batchId: string): Promise<number> {
    const authUser = await AuthService.getAuthUser();
    if (!authUser) {
      throw new Error("User not authenticated");
    }

    // First get all pending tweets in this batch that belong to the user
    const pendingTweets = await db.query.scheduledTweetsTable.findMany({
      where: and(eq(scheduledTweetsTable.batchId, batchId), eq(scheduledTweetsTable.status, "pending")),
      with: {
        agent: true,
      },
    });

    // Filter tweets to only include those owned by the user
    const userTweets = pendingTweets.filter((tweet) => tweet.agent.userId === Number(authUser.id));

    if (userTweets.length === 0) {
      return 0; // No tweets to cancel
    }

    // Get the IDs of the tweets to cancel
    const tweetIds = userTweets.map((tweet) => tweet.id);

    // Update tweets to cancelled status instead of deleting
    // Fix: Process each tweet separately instead of using IN clause
    for (const id of tweetIds) {
      await db
        .update(scheduledTweetsTable)
        .set({
          status: "cancelled",
          processedAt: new Date(),
        })
        .where(and(eq(scheduledTweetsTable.batchId, batchId), eq(scheduledTweetsTable.id, id), eq(scheduledTweetsTable.status, "pending")));
    }

    return tweetIds.length;
  }

  public static async deleteTweet(tweetId: number): Promise<boolean> {
    const authUser = await AuthService.getAuthUser();
    if (!authUser) {
      throw new Error("User not authenticated");
    }

    // First verify the tweet belongs to the user
    const tweet = await db.query.scheduledTweetsTable.findFirst({
      where: eq(scheduledTweetsTable.id, tweetId),
      with: {
        agent: true,
      },
    });

    if (!tweet || !tweet.agent || tweet.agent.userId !== Number(authUser.id)) {
      throw new Error("Tweet not found or not owned by user");
    }

    // Delete the tweet
    await db.delete(scheduledTweetsTable).where(eq(scheduledTweetsTable.id, tweetId));
    return true;
  }

  public static async deleteBatchTweets(batchId: string): Promise<number> {
    const authUser = await AuthService.getAuthUser();
    if (!authUser) {
      throw new Error("User not authenticated");
    }

    // Get all tweets in this batch that belong to the user
    const tweets = await db.query.scheduledTweetsTable.findMany({
      where: eq(scheduledTweetsTable.batchId, batchId),
      with: {
        agent: true,
      },
    });

    // Filter tweets to only include those owned by the user
    const userTweets = tweets.filter((tweet) => tweet.agent.userId === Number(authUser.id));

    if (userTweets.length === 0) {
      return 0; // No tweets to delete
    }

    // Get the IDs of the tweets to delete
    const tweetIds = userTweets.map((tweet) => tweet.id);

    // Delete the tweets one by one instead of using IN clause
    for (const id of tweetIds) {
      await db.delete(scheduledTweetsTable).where(and(eq(scheduledTweetsTable.batchId, batchId), eq(scheduledTweetsTable.id, id)));
    }

    return tweetIds.length;
  }
}

export default ScheduledTweetService;
