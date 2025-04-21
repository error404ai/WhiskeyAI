import { db } from "@/server/db/db";
import { Function, functionsTable } from "@/server/db/schema/functionsTable";
import { functionEnum } from "@/server/enum/functionEnum";
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
            minimum: 1,
            maximum: 500,
          },
          start: {
            type: "number",
            description: "Starting point for pagination",
            minimum: 0,
          },
          time_period: {
            type: "string",
            description: "Time period for trending data",
            enum: ["24h", "30d", "7d"],
          },
          convert: {
            type: "string",
            description: "Comma-separated list of cryptocurrency or fiat currency symbols to convert quotes into",
          },
          convert_id: {
            type: "string",
            description: "Comma-separated list of cryptocurrency or fiat currency IDs to convert quotes into",
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
            minimum: 1,
            maximum: 500,
          },
          start: {
            type: "number",
            description: "Starting point for pagination",
            minimum: 0,
          },
          time_period: {
            type: "string",
            description: "Time period for trending data",
            enum: ["24h", "30d", "7d"],
          },
          sort: {
            type: "string",
            description: "Sort by field",
            enum: ["percent_change_24h"],
          },
          sort_dir: {
            type: "string",
            description: "Sort direction",
            enum: ["asc", "desc"],
          },
          convert: {
            type: "string",
            description: "Comma-separated list of cryptocurrency or fiat currency symbols to convert quotes into",
          },
          convert_id: {
            type: "string",
            description: "Comma-separated list of cryptocurrency or fiat currency IDs to convert quotes into",
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
            minimum: 1,
            maximum: 500,
          },
          start: {
            type: "number",
            description: "Starting point for pagination",
            minimum: 0,
          },
          time_period: {
            type: "string",
            description: "Time period for trending data",
            enum: ["24h", "30d", "7d"],
          },
          convert: {
            type: "string",
            description: "Comma-separated list of cryptocurrency or fiat currency symbols to convert quotes into",
          },
          convert_id: {
            type: "string",
            description: "Comma-separated list of cryptocurrency or fiat currency IDs to convert quotes into",
          },
        },
        required: [],
      },
      type: "agent",
      group: "coinmarket",
    },
    // {
    //   name: functionEnum.COINMARKET_getQuotesHistorical,
    //   description: "Returns an interval of historic market quotes for any cryptocurrency based on time and interval parameters",
    //   parameters: {
    //     type: "object",
    //     properties: {
    //       id: {
    //         type: "string",
    //         description: "One or more comma-separated cryptocurrency IDs",
    //         minLength: 1,
    //       },
    //       interval: {
    //         type: "string",
    //         description: "Interval of time to update data",
    //         enum: ["yearly", "monthly", "weekly", "daily", "hourly", "5m", "10m", "15m", "30m", "45m", "1h", "2h", "3h", "4h", "6h", "12h", "24h", "1d", "2d", "3d", "7d", "14d", "15d", "30d", "60d", "90d", "365d"],
    //       },
    //       count: {
    //         type: "number",
    //         description: "Number of intervals to return",
    //         minimum: 1,
    //         maximum: 10000,
    //       },
    //       time_start: {
    //         type: "string",
    //         description: "Timestamp to start returning data for (ISO 8601 format)",
    //       },
    //       time_end: {
    //         type: "string",
    //         description: "Timestamp to stop returning data for (ISO 8601 format)",
    //       },
    //       symbol: {
    //         type: "string",
    //         description: "Comma-separated list of cryptocurrency symbols",
    //       },
    //       convert: {
    //         type: "string",
    //         description: "Comma-separated list of cryptocurrency or fiat currency symbols to convert quotes into",
    //       },
    //       convert_id: {
    //         type: "string",
    //         description: "Comma-separated list of cryptocurrency or fiat currency IDs to convert quotes into",
    //       },
    //       aux: {
    //         type: "string",
    //         description: "Comma-separated list of auxiliary data fields to return",
    //       },
    //       skip_invalid: {
    //         type: "boolean",
    //         description: "Skip any invalid cryptocurrencies",
    //       },
    //     },
    //     required: ["id", "interval"],
    //   },
    //   type: "agent",
    //   group: "coinmarket",
    // },
    // {
    //   name: functionEnum.COINMARKET_getQuotesLatest,
    //   description: "Returns the latest market quote for 1 or more cryptocurrencies",
    //   parameters: {
    //     type: "object",
    //     properties: {
    //       id: {
    //         type: "string",
    //         description: "One or more comma-separated cryptocurrency IDs",
    //         minLength: 1,
    //       },
    //       slug: {
    //         type: "string",
    //         description: "Comma-separated list of cryptocurrency slugs",
    //       },
    //       symbol: {
    //         type: "string",
    //         description: "Comma-separated list of cryptocurrency symbols",
    //       },
    //       convert: {
    //         type: "string",
    //         description: "Comma-separated list of cryptocurrency or fiat currency symbols to convert quotes into",
    //       },
    //       convert_id: {
    //         type: "string",
    //         description: "Comma-separated list of cryptocurrency or fiat currency IDs to convert quotes into",
    //       },
    //       aux: {
    //         type: "string",
    //         description: "Comma-separated list of auxiliary data fields to return",
    //       },
    //       skip_invalid: {
    //         type: "boolean",
    //         description: "Skip any invalid cryptocurrencies",
    //       },
    //     },
    //     required: ["id"],
    //   },
    //   type: "agent",
    //   group: "coinmarket",
    // },
    {
      name: functionEnum.COINMARKET_getMetadata,
      description: "Returns all static metadata available for one or more cryptocurrencies",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "One or more comma-separated cryptocurrency IDs",
            minLength: 1,
          },
          slug: {
            type: "string",
            description: "Comma-separated list of cryptocurrency slugs",
          },
          symbol: {
            type: "string",
            description: "Comma-separated list of cryptocurrency symbols",
          },
          address: {
            type: "string",
            description: "Comma-separated list of cryptocurrency contract addresses",
          },
          aux: {
            type: "string",
            description: "Comma-separated list of auxiliary data fields to return",
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
    // Solana Tracking APIs
    {
      name: functionEnum.SOLANA_getTokenHolders,
      description: "Get the top 100 holders for a specific token",
      parameters: {
        type: "object",
        properties: {
          tokenAddress: {
            type: "string",
            description: "The token address to get holders for",
          },
        },
        required: ["tokenAddress"],
      },
      type: "agent",
      group: "solanatracker",
    },
    {
      name: functionEnum.SOLANA_getTopTokenHolders,
      description: "Get the top 20 holders for a token, recommended over the /holders endpoint",
      parameters: {
        type: "object",
        properties: {
          tokenAddress: {
            type: "string",
            description: "The token address to get top holders for",
          },
        },
        required: ["tokenAddress"],
      },
      type: "agent",
      group: "solanatracker",
    },
    {
      name: functionEnum.SOLANA_getLatestTokens,
      description: "Retrieve the latest 100 tokens",
      parameters: {},
      type: "agent",
      group: "solanatracker",
    },
    {
      name: functionEnum.SOLANA_getTrendingTokens,
      description: "Get the top 100 trending tokens based on transaction volume in the past hour",
      parameters: {},
      type: "agent",
      group: "solanatracker",
    },
    {
      name: functionEnum.SOLANA_getTrendingTokensByTimeframe,
      description: "Returns trending tokens for a specific time interval",
      parameters: {
        type: "object",
        properties: {
          timeframe: {
            type: "string",
            description: "Time interval for trending data",
            enum: ["5m", "15m", "30m", "1h", "2h", "3h", "4h", "5h", "6h", "12h", "24h"],
          },
        },
        required: ["timeframe"],
      },
      type: "agent",
      group: "solanatracker",
    },
    {
      name: functionEnum.SOLANA_getTopVolumeTokens,
      description: "Retrieve the top 100 tokens sorted by highest volume",
      parameters: {},
      type: "agent",
      group: "solanatracker",
    },
    {
      name: functionEnum.SOLANA_getVolumeTokensByTimeframe,
      description: "Returns trending tokens for a specific time interval",
      parameters: {
        type: "object",
        properties: {
          timeframe: {
            type: "string",
            description: "Time interval for volume data",
            enum: ["5m", "15m", "30m", "1h", "6h", "12h", "24h"],
          },
        },
        required: ["timeframe"],
      },
      type: "agent",
      group: "solanatracker",
    },
    {
      name: functionEnum.SOLANA_getMultiAllTokens,
      description: "Get an overview of latest, graduating, and graduated tokens",
      parameters: {},
      type: "agent",
      group: "solanatracker",
    },
    {
      name: functionEnum.SOLANA_getMultiGraduatedTokens,
      description: "Overview of all graduated pumpfun/moonshot tokens",
      parameters: {},
      type: "agent",
      group: "solanatracker",
    },
    {
      name: functionEnum.SOLANA_getTokenPrice,
      description: "Get price information for a single token",
      parameters: {
        type: "object",
        properties: {
          token: {
            type: "string",
            description: "The token address",
          },
          priceChanges: {
            type: "boolean",
            description: "Returns price change percentages for the token up to 24 hours ago",
          },
        },
        required: ["token"],
      },
      type: "agent",
      group: "solanatracker",
    },
    {
      name: functionEnum.SOLANA_getMultiTokenPrices,
      description: "Get price information for multiple tokens (up to 100)",
      parameters: {
        type: "object",
        properties: {
          tokens: {
            type: "string",
            description: "Comma-separated list of token addresses",
          },
        },
        required: ["tokens"],
      },
      type: "agent",
      group: "solanatracker",
    },
    {
      name: functionEnum.SOLANA_getWalletTokens,
      description: "Get all tokens in a wallet with current value in USD",
      parameters: {
        type: "object",
        properties: {
          owner: {
            type: "string",
            description: "The wallet address",
          },
        },
        required: ["owner"],
      },
      type: "agent",
      group: "solanatracker",
    },
    {
      name: functionEnum.SOLANA_getWalletTrades,
      description: "Get the latest trades of a wallet",
      parameters: {
        type: "object",
        properties: {
          owner: {
            type: "string",
            description: "The wallet address",
          },
          cursor: {
            type: "string",
            description: "Cursor for pagination",
          },
        },
        required: ["owner"],
      },
      type: "agent",
      group: "solanatracker",
    },
    {
      name: functionEnum.SOLANA_getTokenChart,
      description: "Get OLCVH (Open, Low, Close, Volume, High) data for charts",
      parameters: {
        type: "object",
        properties: {
          token: {
            type: "string",
            description: "The token address",
          },
          type: {
            type: "string",
            description: "Time interval (e.g., '1s', '1m', '1h', '1d')",
            enum: ["1s", "5s", "15s", "1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1d", "3d", "1w", "1mn"],
          },
          time_from: {
            type: "number",
            description: "Start time (Unix timestamp in seconds)",
          },
          time_to: {
            type: "number",
            description: "End time (Unix timestamp in seconds)",
          },
          marketCap: {
            type: "boolean",
            description: "Return chart for market cap instead of pricing",
          },
          removeOutliers: {
            type: "boolean",
            description: "Set to false to disable outlier removal, true by default",
          },
        },
        required: ["token"],
      },
      type: "agent",
      group: "solanatracker",
    },
    {
      name: functionEnum.SOLANA_getTokenPoolChart,
      description: "Get OLCVH (Open, Low, Close, Volume, High) data for charts for a specific pool",
      parameters: {
        type: "object",
        properties: {
          token: {
            type: "string",
            description: "The token address",
          },
          pool: {
            type: "string",
            description: "The pool address",
          },
          type: {
            type: "string",
            description: "Time interval (e.g., '1s', '1m', '1h', '1d')",
            enum: ["1s", "5s", "15s", "1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1d", "3d", "1w", "1mn"],
          },
          time_from: {
            type: "number",
            description: "Start time (Unix timestamp in seconds)",
          },
          time_to: {
            type: "number",
            description: "End time (Unix timestamp in seconds)",
          },
          marketCap: {
            type: "boolean",
            description: "Return chart for market cap instead of pricing",
          },
          removeOutliers: {
            type: "boolean",
            description: "Set to false to disable outlier removal, true by default",
          },
        },
        required: ["token", "pool"],
      },
      type: "agent",
      group: "solanatracker",
    },
    {
      name: functionEnum.SOLANA_getTokenHoldersChart,
      description: "Get token holder count data over time",
      parameters: {
        type: "object",
        properties: {
          token: {
            type: "string",
            description: "The token address",
          },
          type: {
            type: "string",
            description: "Time interval (e.g., '1s', '1m', '1h', '1d')",
            enum: ["1s", "5s", "15s", "1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1d", "3d", "1w", "1mn"],
          },
          time_from: {
            type: "number",
            description: "Start time (Unix timestamp in seconds)",
          },
          time_to: {
            type: "number",
            description: "End time (Unix timestamp in seconds)",
          },
        },
        required: ["token"],
      },
      type: "agent",
      group: "solanatracker",
    },
    {
      name: functionEnum.SOLANA_getFirstBuyers,
      description: "Retrieve the first 100 buyers of a token with Profit and Loss data for each wallet",
      parameters: {
        type: "object",
        properties: {
          token: {
            type: "string",
            description: "The token address",
          },
        },
        required: ["token"],
      },
      type: "agent",
      group: "solanatracker",
    },
    // Telegram functions
    {
      name: functionEnum.TELEGRAM_getChannelMessages,
      description: "Get messages from a Telegram channel",
      parameters: {
        type: "object",
        properties: {
          channelUsername: {
            type: "string",
            description: "The username of the channel to get messages from",
          },
          limit: {
            type: "number",
            description: "The maximum number of messages to retrieve (default: 100)",
            minimum: 1,
            maximum: 100,
          },
        },
        required: ["channelUsername"],
      },
      type: "agent",
      group: "telegram",
    },
  ];

  async seed(): Promise<void> {
    await db.delete(functionsTable);
    await db.insert(functionsTable).values(this.functions);
  }
}
