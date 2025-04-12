import { db } from "@/db/db";
import { NewScheduledTweet, ScheduledTweet, agentPlatformsTable, scheduledTweetsTable } from "@/db/schema";
import { and, eq, lte } from "drizzle-orm";
import TwitterService from "./TwitterService";
import AuthService from "./auth/authService";

export class ScheduledTweetService {
  /**
   * Create a scheduled tweet
   * @param data The scheduled tweet data
   * @returns The created tweet ID
   */
  public static async createScheduledTweet(data: NewScheduledTweet): Promise<number> {
    const [result] = await db.insert(scheduledTweetsTable).values(data).returning({ id: scheduledTweetsTable.id });
    return result.id;
  }

  /**
   * Get all scheduled tweets for the current user
   * @returns Array of scheduled tweets
   */
  public static async getScheduledTweets(): Promise<ScheduledTweet[]> {
    const authUser = await AuthService.getAuthUser();
    if (!authUser) {
      throw new Error("User not authenticated");
    }

    // Join with agents to get only the tweets for the current user's agents
    const tweets = await db.query.scheduledTweetsTable.findMany({
      with: {
        agent: true,
      },
    });

    // Filter the tweets to only include ones where the agent belongs to the current user
    return tweets.filter(tweet => tweet.agent && tweet.agent.userId === Number(authUser.id));
  }

  /**
   * Get pending scheduled tweets that need to be processed
   * @returns Array of pending scheduled tweets
   */
  public static async getPendingScheduledTweets(): Promise<(ScheduledTweet & { agent: { uuid: string } })[]> {
    const now = new Date();

    // Get all pending tweets that are scheduled to be posted now or in the past
    const pendingTweets = await db.query.scheduledTweetsTable.findMany({
      where: and(
        eq(scheduledTweetsTable.status, "pending"),
        lte(scheduledTweetsTable.scheduledAt, now)
      ),
      with: {
        agent: true,
      },
    });

    // Return only the tweets with the required agent properties
    return pendingTweets.map(tweet => ({
      ...tweet,
      agent: {
        uuid: tweet.agent.uuid,
      },
    }));
  }

  /**
   * Process a scheduled tweet
   * @param tweet The tweet to process
   * @returns Success status
   */
  public static async processTweet(tweet: ScheduledTweet & { agent: { uuid: string } }): Promise<boolean> {
    try {
      // Get the agent platform for Twitter
      const agentPlatform = await db.query.agentPlatformsTable.findFirst({
        where: and(
          eq(agentPlatformsTable.agentId, tweet.agentId),
          eq(agentPlatformsTable.type, "twitter"),
          eq(agentPlatformsTable.enabled, true)
        ),
      });

      if (!agentPlatform) {
        throw new Error(`No enabled Twitter platform found for agent ${tweet.agentId}`);
      }

      // Initialize Twitter service
      const twitterService = new TwitterService(agentPlatform);
      
      // Post the tweet
      await twitterService.postTweet(tweet.content);

      // Update the tweet status to completed
      await db
        .update(scheduledTweetsTable)
        .set({
          status: "completed",
          processedAt: new Date(),
        })
        .where(eq(scheduledTweetsTable.id, tweet.id));

      return true;
    } catch (error) {
      // Update the tweet status to failed
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

  /**
   * Delete a scheduled tweet
   * @param tweetId The tweet ID to delete
   * @returns Success status
   */
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

    // Delete the tweet
    await db.delete(scheduledTweetsTable).where(eq(scheduledTweetsTable.id, tweetId));
    return true;
  }
}

export default ScheduledTweetService; 