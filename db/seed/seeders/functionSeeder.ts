import { db } from "@/db/db";
import { Function, functionsTable } from "@/db/schema/functionsTable";
import { Seeder } from "../SeederInterface";

export class FunctionsSeeder implements Seeder {
  private functions: Omit<Function, "id">[] = [
    {
      name: "get_home_timeline",
      description: "Get the most recent tweets from the home timeline of the Twitter account",
      parameters: {},
      type: "agent",
    },
    {
      name: "post_tweet",
      description: "Create and publish a new tweet on Twitter",
      parameters: {
        text: {
          type: "string",
          description: "The content of the tweet to post",
          required: true,
        },
      },
      type: "trigger",
    },
    {
      name: "reply_tweet",
      description: "Reply to an existing tweet on Twitter",
      parameters: {
        text: {
          type: "string",
          description: "The content of the reply",
          required: true,
        },
        tweetId: {
          type: "string",
          description: "The ID of the tweet to reply to",
          required: true,
        },
      },
      type: "agent",
    },
    {
      name: "like_tweet",
      description: "Like a specific tweet on Twitter",
      parameters: {
        tweetId: {
          type: "string",
          description: "The ID of the tweet to like",
          required: true,
        },
      },
      type: "agent",
    },
    {
      name: "quote_tweet",
      description: "Quote and comment on a tweet on Twitter",
      parameters: {
        quotedTweetId: {
          type: "string",
          description: "The ID of the tweet to quote",
          required: true,
        },
        comment: {
          type: "string",
          description: "The content of your quote",
          required: true,
        },
      },
      type: "agent",
    },
    {
      name: "retweet",
      description: "Retweet an existing tweet on Twitter",
      parameters: {
        tweetId: {
          type: "string",
          description: "The ID of the tweet to retweet",
          required: true,
        },
      },
      type: "agent",
    },
  ];

  async seed(): Promise<void> {
    await db.insert(functionsTable).values(this.functions);
  }
}
