import { db } from "@/db/db";
import { Function, functionsTable } from "@/db/schema/functionsTable";
import { Seeder } from "../SeederInterface";

export class FunctionsSeeder implements Seeder {
  private functions: Omit<Function, "id">[] = [
    {
      name: "get_home_timeline",
      description: "Get the most recent tweets from the home timeline of the Twitter account",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
      type: "agent",
    },
    {
      name: "post_tweet",
      description: "Create and publish a new tweet on Twitter",
      parameters: {
        type: "object",
        properties: {
          text: {
            type: "string",
            description: "The content of the tweet to post",
          },
        },
        required: ["text"],
      },
      type: "trigger",
    },
    {
      name: "reply_tweet",
      description: "Reply to an existing tweet on Twitter",
      parameters: {
        type: "object",
        properties: {
          text: {
            type: "string",
            description: "The content of the reply",
          },
          tweetId: {
            type: "string",
            description: "The ID of the tweet to reply to",
          },
        },
        required: ["text", "tweetId"],
      },
      type: "trigger",
    },
    {
      name: "like_tweet",
      description: "Like a specific tweet on Twitter",
      parameters: {
        type: "object",
        properties: {
          tweetId: {
            type: "string",
            description: "The ID of the tweet to like",
          },
        },
        required: ["tweetId"],
      },
      type: "trigger",
    },
    {
      name: "quote_tweet",
      description: "Quote and comment on a tweet on Twitter",
      parameters: {
        type: "object",
        properties: {
          quotedTweetId: {
            type: "string",
            description: "The ID of the tweet to quote",
          },
          comment: {
            type: "string",
            description: "The content of your quote",
          },
        },
        required: ["quotedTweetId", "comment"],
      },
      type: "trigger",
    },
    {
      name: "retweet",
      description: "Retweet an existing tweet on Twitter",
      parameters: {
        type: "object",
        properties: {
          tweetId: {
            type: "string",
            description: "The ID of the tweet to retweet",
          },
        },
        required: ["tweetId"],
      },
      type: "trigger",
    },
    {
      name: "RPC_getAccountInfo",
      description: "Returns all information associated with the account of provided Pubkey",
      parameters: {
        type: "object",
        properties: {
          publicKey: {
            type: "string",
            description: "The public key of the account",
          },
        },
        required: ["publicKey"],
      },
      type: "rpc",
    },
  ];

  async seed(): Promise<void> {
    // truncate the table
    await db.delete(functionsTable);
    await db.insert(functionsTable).values(this.functions);
  }
}
