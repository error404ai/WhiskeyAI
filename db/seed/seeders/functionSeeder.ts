import { db } from "@/db/db";
import { Function, functionsTable } from "@/db/schema/functionsTable";
import { functionEnum } from "@/http/enum/functionEnum";
import { Seeder } from "../SeederInterface";

export class FunctionsSeeder implements Seeder {
  private functions: Omit<Function, "id">[] = [
    {
      name: functionEnum.get_home_timeline,
      description: "Get the most recent tweets from the home timeline of the Twitter account",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
      type: "agent",
    },
    {
      name: functionEnum.post_tweet,
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
      name: functionEnum.reply_tweet,
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
      name: functionEnum.like_tweet,
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
      name: functionEnum.quote_tweet,
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
      name: functionEnum.retweet,
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
      name: functionEnum.RPC_getAccountInfo,
      description: "This Rpc method Returns all information associated with the account of provided Pubkey",
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
    {
      name: functionEnum.RPC_getBalance,
      description: "This Rpc method Returns the balance of the account of provided Pubkey",
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
    {
      name: functionEnum.RPC_getBlock,
      description: "This Rpc method Returns identity and transaction information about a confirmed block in the ledger.",
      parameters: {
        type: "object",
        properties: {
          slot: {
            type: "number",
            description: "The slot number of the block to retrieve encoded as u64 (64-bit unsigned integer) integer",
          },
        },
        required: ["slot"],
      },
      type: "rpc",
    },
    //dexscreener
    {
      name: functionEnum.DEX_getLatestTokenProfiles,
      description: "Get the latest token profiles",
      parameters: {},
      type: "dexscreener",
    },
    {
      name: functionEnum.DEX_getLatestBoostedTokens,
      description: "Get the latest boosted tokens",
      parameters: {},
      type: "dexscreener",
    },
    {
      name: functionEnum.DEX_getTopBoostedTokens,
      description: "Get the tokens with most active boosts",
      parameters: {},
      type: "dexscreener",
    },
    {
      name: functionEnum.DEX_getTokenOrders,
      description: "Check orders paid for of token",
      parameters: {
        type: "object",
        properties: {
          chainId: {
            type: "string",
            description: "The chain ID of the token",
          },
          tokenAddress: {
            type: "string",
            description: "The token address to check orders for",
          },
        },
        required: ["chainId", "tokenAddress"],
      },
      type: "dexscreener",
    },
    {
      name: functionEnum.DEX_getPairsByChainAndPairAddress,
      description: "Get one or multiple pairs by chain and pair address",
      parameters: {
        type: "object",
        properties: {
          chainId: {
            type: "string",
            description: "The chain ID of the pair",
          },
          pairId: {
            type: "string",
            description: "The pair ID to get information for",
          },
        },
        required: ["chainId", "pairId"],
      },
      type: "dexscreener",
    },
    {
      name: functionEnum.DEX_searchPairs,
      description: "Search for pairs matching query",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query for pairs (e.g. SOL/USDC)",
          },
        },
        required: ["query"],
      },
      type: "dexscreener",
    },
    {
      name: functionEnum.DEX_getTokenPairs,
      description: "Get the pools of a given token address",
      parameters: {
        type: "object",
        properties: {
          chainId: {
            type: "string",
            description: "The chain ID of the token",
          },
          tokenAddress: {
            type: "string",
            description: "The token address to get pairs for",
          },
        },
        required: ["chainId", "tokenAddress"],
      },
      type: "dexscreener",
    },
    {
      name: functionEnum.DEX_getTokensByAddress,
      description: "Get one or multiple pairs by token address",
      parameters: {
        type: "object",
        properties: {
          chainId: {
            type: "string",
            description: "The chain ID of the tokens",
          },
          tokenAddresses: {
            type: "string",
            description: "One or multiple comma-separated token addresses (up to 30 addresses)",
          },
        },
        required: ["chainId", "tokenAddresses"],
      },
      type: "dexscreener",
    },
  ];

  async seed(): Promise<void> {
    await db.delete(functionsTable);
    await db.insert(functionsTable).values(this.functions);
  }
}
