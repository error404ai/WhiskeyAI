/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/db/db";
import { NewScheduledTweet, ScheduledTweet, agentPlatformsTable, agentsTable, scheduledTweetsTable } from "@/db/schema";
import { DrizzlePaginator, PaginationResult } from "@skmirajbn/drizzle-paginator";
import { and, eq, lte } from "drizzle-orm";
import { PaginatedProps } from "../controllers/ScheduledTweetController";
import TwitterService from "./TwitterService";
import AuthService from "./auth/authService";

export class ScheduledTweetService {
  public static async createScheduledTweet(data: NewScheduledTweet): Promise<number> {
    const [result] = await db.insert(scheduledTweetsTable).values(data).returning({ id: scheduledTweetsTable.id });
    return result.id;
  }

  public static async getScheduledTweets(params: PaginatedProps = { page: 1, perPage: 10 }): Promise<PaginationResult<ScheduledTweet>> {
    const authUser = await AuthService.getAuthUser();
    if (!authUser) {
      throw new Error("User not authenticated");
    }

    const query = db.query.scheduledTweetsTable.findMany({
      where: (scheduledTweetsTable, { inArray, eq }) => {
        const subquery = db
          .select({ id: agentsTable.id })
          .from(agentsTable)
          .where(eq(agentsTable.userId, Number(authUser.id)));
        return inArray(scheduledTweetsTable.agentId, subquery);
      },
      with: {
        agent: {
          with: {
            user: true,
          },
        },
      },
      orderBy: (scheduledTweetsTable, { desc }) => [desc(scheduledTweetsTable.scheduledAt)],
    });

    const paginator = new DrizzlePaginator<ScheduledTweet>(db, query).page(params.page || 1).allowColumns(["id", "agentId", "content", "scheduledAt", "status", "createdAt", "processedAt", "errorMessage"]);
    paginator.map((item) => {
      return {
        ...item,
        agentName: (item.agent as any)?.[3],
      };
    });
    // console.log("paginator is", (await paginator.paginate(10)).data[0].agent);
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

    // Delete the tweet
    await db.delete(scheduledTweetsTable).where(eq(scheduledTweetsTable.id, tweetId));
    return true;
  }
}

export default ScheduledTweetService;
