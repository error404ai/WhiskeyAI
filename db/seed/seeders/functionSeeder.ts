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
      group: "twitter",
    },
    {
      name: functionEnum.post_tweet,
      description: "Create and publish a new tweet on Twitter. Tweet length should not exceed 280 characters including links.",
      parameters: {
        type: "object",
        properties: {
          text: {
            type: "string",
            description: "The content of the tweet to post, up to 280 characters",
          },
        },
        required: ["text"],
      },
      type: "trigger",
      group: "twitter",
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
      group: "twitter",
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
      group: "twitter",
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
      group: "twitter",
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
      group: "twitter",
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
      type: "agent",
      group: "rpc",
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
      type: "agent",
      group: "rpc",
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
      type: "agent",
      group: "rpc",
    },
    //dexscreener
    {
      name: functionEnum.DEX_getLatestTokenProfiles,
      description: "Get the latest token profile from dexscreener.com",
      parameters: {},
      type: "agent",
      group: "dexscreener",
    },
    {
      name: functionEnum.DEX_getLatestBoostedTokens,
      description: "Get the latest boosted tokens from dexscreener.com",
      parameters: {},
      type: "agent",
      group: "dexscreener",
    },
    {
      name: functionEnum.DEX_getTopBoostedTokens,
      description: "Get the tokens with most active boosts from dexscreener.com",
      parameters: {},
      type: "agent",
      group: "dexscreener",
    },
    {
      name: functionEnum.DEX_getTokenOrders,
      description: "Check orders paid for of token on dexscreener.com",
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
      type: "agent",
      group: "dexscreener",
    },
    {
      name: functionEnum.DEX_getPairsByChainAndPairAddress,
      description: "Get one or multiple pairs by chain and pair address from dexscreener.com",
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
      type: "agent",
      group: "dexscreener",
    },
    {
      name: functionEnum.DEX_searchPairs,
      description: "Search for pairs matching query from dexscreener.com",
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
      type: "agent",
      group: "dexscreener",
    },
    {
      name: functionEnum.DEX_getTokenPairs,
      description: "Get the pools of a given token address from dexscreener.com",
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
      type: "agent",
      group: "dexscreener",
    },
    {
      name: functionEnum.DEX_getTokensByAddress,
      description: "Get one or multiple pairs by token address from dexscreener.com",
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
      type: "agent",
      group: "dexscreener",
    },
    {
      name: functionEnum.COINMARKET_getFearAndGreedLatest,
      description: "Returns the lastest CMC Crypto Fear and Greed value from coinmarketcap.com",
      parameters: {},
      type: "agent",
      group: "coinmarket",
    },
    {
      name: functionEnum.COINMARKET_getFearAndGreedHistorical,
      description: "Returns a paginated list of all CMC Crypto Fear and Greed values at 12am UTC time from coinmarketcap.com",
      parameters: {},
      type: "agent",
      group: "coinmarket",
    },
    {
      name: functionEnum.COINMARKET_getTrendingMostVisited,
      description: "Returns a paginated list of all trending cryptocurrency market data, determined and sorted by traffic to coin detail pages",
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Number of results to return (1-500)",
          },
          start: {
            type: "number",
            description: "Starting point for pagination",
          },
        },
        required: [],
      },
      type: "agent",
      group: "coinmarket",
    },
    {
      name: functionEnum.COINMARKET_getTrendingGainersLosers,
      description: "Returns a paginated list of all trending cryptocurrencies, determined and sorted by the largest price gains or losses",
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Number of results to return (1-500)",
          },
          start: {
            type: "number",
            description: "Starting point for pagination",
          },
          sort: {
            type: "string",
            description: "Sort by field (e.g. percent_change_24h)",
          },
        },
        required: [],
      },
      type: "agent",
      group: "coinmarket",
    },
    {
      name: functionEnum.COINMARKET_getTrendingLatest,
      description: "Returns a paginated list of all trending cryptocurrency market data, determined and sorted by CoinMarketCap search volume",
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Number of results to return (1-500)",
          },
          start: {
            type: "number",
            description: "Starting point for pagination",
          },
        },
        required: [],
      },
      type: "agent",
      group: "coinmarket",
    },
    {
      name: functionEnum.COINMARKET_getQuotesHistorical,
      description: "Returns an interval of historic market quotes for any cryptocurrency based on time and interval parameters",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "One or more comma-separated cryptocurrency IDs",
          },
          interval: {
            type: "string",
            description: "Interval of time to update data (e.g. 1h, 1d, 1w)",
          },
          count: {
            type: "number",
            description: "Number of intervals to return",
          },
          time_start: {
            type: "string",
            description: "Timestamp to start returning data for",
          },
          time_end: {
            type: "string",
            description: "Timestamp to stop returning data for",
          },
        },
        required: ["id", "interval"],
      },
      type: "agent",
      group: "coinmarket",
    },
    {
      name: functionEnum.COINMARKET_getQuotesLatest,
      description: "Returns the latest market quote for 1 or more cryptocurrencies",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "One or more comma-separated cryptocurrency IDs",
          },
          convert: {
            type: "string",
            description: "Comma-separated list of cryptocurrency or fiat currency symbols to convert quotes into",
          },
          skip_invalid: {
            type: "boolean",
            description: "Skip any invalid cryptocurrencies",
          },
        },
        required: ["id"],
      },
      type: "agent",
      group: "coinmarket",
    },
    {
      name: functionEnum.COINMARKET_getMetadata,
      description: "Returns all static metadata available for one or more cryptocurrencies",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "One or more comma-separated cryptocurrency IDs",
          },
          skip_invalid: {
            type: "boolean",
            description: "Skip any invalid cryptocurrencies",
          },
        },
        required: ["id"],
      },
      type: "agent",
      group: "coinmarket",
    },
  ];

  async seed(): Promise<void> {
    await db.delete(functionsTable);
    await db.insert(functionsTable).values(this.functions);
  }
}
