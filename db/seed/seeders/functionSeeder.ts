import { db } from "@/db/db";
import { Function, functionsTable } from "@/db/schema/functionsTable";
import { Seeder } from "../SeederInterface";

export class FunctionsSeeder implements Seeder {
  private functions: Omit<Function, "id">[] = [
    // Agent Functions - Twitter Service Functions
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
      type: "agent",
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
    {
      name: "search_internet",
      description: "Search the internet for information",
      parameters: {
        query: {
          type: "string",
          description: "The search query",
          required: true,
        },
        max_results: {
          type: "integer",
          description: "Maximum number of results to return",
          required: false,
          default: 5,
        },
      },
      type: "agent",
    },
    {
      name: "search_twitter",
      description: "Search twitter for information & sentiment",
      parameters: {
        query: {
          type: "string",
          description: "The search query",
          required: true,
        },
        include_sentiment: {
          type: "boolean",
          description: "Whether to include sentiment analysis",
          required: false,
          default: true,
        },
      },
      type: "agent",
    },
    {
      name: "get_token_info",
      description: "Retrieve token information",
      parameters: {
        token_symbol: {
          type: "string",
          description: "Symbol of the token to retrieve information for",
          required: true,
        },
      },
      type: "agent",
    },
    {
      name: "generate_image",
      description: "Use to generate an image based on a description",
      parameters: {
        prompt: {
          type: "string",
          description: "Description of the image to generate",
          required: true,
        },
        style: {
          type: "string",
          description: "Style of the image",
          required: false,
          default: "realistic",
        },
      },
      type: "agent",
    },
    {
      name: "generate_voice",
      description: "Use to convert text to speech",
      parameters: {
        text: {
          type: "string",
          description: "The text to convert to speech",
          required: true,
        },
        voice: {
          type: "string",
          description: "Voice type to use",
          required: false,
          default: "neutral",
        },
      },
      type: "agent",
    },
    {
      name: "send_tokens",
      description: "Use to send tokens from your account to another",
      parameters: {
        recipient_address: {
          type: "string",
          description: "Recipient wallet address",
          required: true,
        },
        amount: {
          type: "number",
          description: "Amount of tokens to send",
          required: true,
        },
        token_type: {
          type: "string",
          description: "Type of token to send",
          required: true,
        },
      },
      type: "agent",
    },
    {
      name: "swap_tokens",
      description: "Use to swap tokens from one type to another",
      parameters: {
        from_token: {
          type: "string",
          description: "Token type to swap from",
          required: true,
        },
        to_token: {
          type: "string",
          description: "Token type to swap to",
          required: true,
        },
        amount: {
          type: "number",
          description: "Amount to swap",
          required: true,
        },
      },
      type: "agent",
    },

    // Trigger Functions
    {
      name: "check_mentions",
      description: "Check for new mentions on Twitter",
      parameters: {
        include_keywords: {
          type: "array",
          items: {
            type: "string",
          },
          description: "Keywords to filter mentions by",
          required: false,
        },
        exclude_keywords: {
          type: "array",
          items: {
            type: "string",
          },
          description: "Keywords to exclude mentions by",
          required: false,
        },
      },
      type: "trigger",
    },
    {
      name: "monitor_hashtag",
      description: "Monitor Twitter for specific hashtags",
      parameters: {
        hashtags: {
          type: "array",
          items: {
            type: "string",
          },
          description: "List of hashtags to monitor",
          required: true,
        },
        sentiment_filter: {
          type: "string",
          description: "Filter by sentiment",
          required: false,
          default: "any",
        },
      },
      type: "trigger",
    },
    {
      name: "track_account_activity",
      description: "Monitor activity from specific Twitter accounts",
      parameters: {
        account_handles: {
          type: "array",
          items: {
            type: "string",
          },
          description: "List of Twitter handles to monitor",
          required: true,
        },
        activity_types: {
          type: "array",
          items: {
            type: "string",
          },
          description: "Types of activities to monitor",
          required: false,
          default: ["tweets"],
        },
      },
      type: "trigger",
    },
    {
      name: "scheduled_tweet",
      description: "Schedule tweets at specific times",
      parameters: {
        content_template: {
          type: "string",
          description: "Template for the tweet content",
          required: true,
        },
        schedule_time: {
          type: "string",
          description: "Time to schedule the tweet",
          required: true,
        },
      },
      type: "trigger",
    },
    {
      name: "monitor_token_price",
      description: "Monitor price changes for specific tokens",
      parameters: {
        token_symbols: {
          type: "array",
          items: {
            type: "string",
          },
          description: "List of token symbols to monitor",
          required: true,
        },
        price_change_threshold: {
          type: "number",
          description: "Percentage threshold to trigger an action",
          required: false,
          default: 5.0,
        },
      },
      type: "trigger",
    },
  ];

  async seed(): Promise<void> {
    await db.insert(functionsTable).values(this.functions);
  }
}
