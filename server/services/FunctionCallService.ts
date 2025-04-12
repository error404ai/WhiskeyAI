/* eslint-disable @typescript-eslint/no-explicit-any */
import { functionEnum } from "@/server/enum/functionEnum";
import coinMarketService from "./externalApi/CoinMarketService";
import dexscreenerService from "./externalApi/DexscreenerService";
import QuickNodeRpcService from "./externalApi/QuickNodeRpcService";
import solanaTrackingService from "./externalApi/SolanaTrackingService";
import telegramService from "./TelegramService";
import TwitterService from "./TwitterService";

export class FunctionCallService {
  private twitterService: TwitterService | null = null;
  private _isSecondExecution = false;

  constructor() {}

  public setTwitterService(twitterService: TwitterService): void {
    this.twitterService = twitterService;
  }

  public async executeFunctionByName(functionName: string, args: any): Promise<any> {
    if (!this.twitterService) {
      console.error(`[Twitter] Twitter service not initialized before calling ${functionName}`);
      throw new Error("Twitter service not initialized");
    }

    console.log(`[FunctionCall] Executing function: ${functionName}`, { arguments: args });

    if (functionName === "post_tweet" && this._isSecondExecution) {
      console.log(`[Twitter] Skipping second execution of post_tweet to avoid duplicate content error`);
      return {
        success: true,
        message: "Tweet already sent in first execution. Skipping duplicate execution.",
      };
    }

    try {
      switch (functionName) {
        // Twitter functions
        case functionEnum.get_home_timeline:
          return await this.twitterService.getHomeTimeLine();
        case functionEnum.post_tweet:
          return await this.twitterService.postTweet(args.text);
        case functionEnum.reply_tweet:
          return await this.twitterService.replyTweet(args.text, args.tweetId);
        case functionEnum.like_tweet:
          return await this.twitterService.likeTweet(args.tweetId);
        case functionEnum.quote_tweet:
          return await this.twitterService.quoteTweet(args.quotedTweetId, args.comment);
        case functionEnum.retweet:
          return await this.twitterService.reTweet(args.tweetId);

        // RPC functions
        case functionEnum.RPC_getAccountInfo:
          return await QuickNodeRpcService.getAccountInfo(args.publicKey);
        case functionEnum.RPC_getBalance:
          return await QuickNodeRpcService.getBalance(args.publicKey);
        case functionEnum.RPC_getBlock:
          return await QuickNodeRpcService.getBlock(args.slot);

        // Dexscreener functions
        case functionEnum.DEX_getLatestTokenProfiles:
          return await dexscreenerService.getLatestTokenProfiles();
        case functionEnum.DEX_getLatestBoostedTokens:
          return await dexscreenerService.getLatestBoostedTokens();
        case functionEnum.DEX_getTopBoostedTokens:
          return await dexscreenerService.getTopBoostedTokens();
        case functionEnum.DEX_getTokenOrders:
          return await dexscreenerService.getTokenOrders(args.chainId, args.tokenAddress);
        case functionEnum.DEX_getPairsByChainAndPairAddress:
          return await dexscreenerService.getPairsByChainAndPairAddress(args.chainId, args.pairId);
        case functionEnum.DEX_searchPairs:
          return await dexscreenerService.searchPairs(args.query);
        case functionEnum.DEX_getTokenPairs:
          return await dexscreenerService.getTokenPairs(args.chainId, args.tokenAddress);
        case functionEnum.DEX_getTokensByAddress:
          return await dexscreenerService.getTokensByAddress(args.chainId, args.tokenAddresses);

        // CoinMarket functions
        case functionEnum.COINMARKET_getFearAndGreedLatest:
          return await coinMarketService.getFearAndGreedLatest();
        case functionEnum.COINMARKET_getFearAndGreedHistorical:
          return await coinMarketService.getFearAndGreedHistorical();
        case functionEnum.COINMARKET_getTrendingMostVisited:
          return await coinMarketService.getTrendingMostVisited(args);
        case functionEnum.COINMARKET_getTrendingGainersLosers:
          return await coinMarketService.getTrendingGainersLosers(args);
        case functionEnum.COINMARKET_getTrendingLatest:
          return await coinMarketService.getTrendingLatest(args);
        case functionEnum.COINMARKET_getMetadata:
          return await coinMarketService.getMetadata(args);

        // Solana Tracking functions
        case functionEnum.SOLANA_getTokenHolders:
          return await solanaTrackingService.getTokenHolders(args.tokenAddress);
        case functionEnum.SOLANA_getTopTokenHolders:
          return await solanaTrackingService.getTopTokenHolders(args.tokenAddress);
        case functionEnum.SOLANA_getLatestTokens:
          return await solanaTrackingService.getLatestTokens();
        case functionEnum.SOLANA_getTrendingTokens:
          return await solanaTrackingService.getTrendingTokens();
        case functionEnum.SOLANA_getTrendingTokensByTimeframe:
          return await solanaTrackingService.getTrendingTokensByTimeframe(args.timeframe);
        case functionEnum.SOLANA_getTopVolumeTokens:
          return await solanaTrackingService.getTopVolumeTokens();
        case functionEnum.SOLANA_getVolumeTokensByTimeframe:
          return await solanaTrackingService.getVolumeTokensByTimeframe(args.timeframe);
        case functionEnum.SOLANA_getMultiAllTokens:
          return await solanaTrackingService.getMultiAllTokens();
        case functionEnum.SOLANA_getMultiGraduatedTokens:
          return await solanaTrackingService.getMultiGraduatedTokens();
        case functionEnum.SOLANA_getTokenPrice:
          return await solanaTrackingService.getTokenPrice(args.token, args.priceChanges);
        case functionEnum.SOLANA_getMultiTokenPrices:
          return await solanaTrackingService.getMultiTokenPrices(args.tokens);
        case functionEnum.SOLANA_getWalletTokens:
          return await solanaTrackingService.getWalletTokens(args.owner);
        case functionEnum.SOLANA_getWalletTrades:
          return await solanaTrackingService.getWalletTrades(args.owner, args.cursor);
        case functionEnum.SOLANA_getTokenChart:
          return await solanaTrackingService.getTokenChart(args.token, {
            type: args.type,
            time_from: args.time_from,
            time_to: args.time_to,
            marketCap: args.marketCap,
            removeOutliers: args.removeOutliers,
          });
        case functionEnum.SOLANA_getTokenPoolChart:
          return await solanaTrackingService.getTokenPoolChart(args.token, args.pool, {
            type: args.type,
            time_from: args.time_from,
            time_to: args.time_to,
            marketCap: args.marketCap,
            removeOutliers: args.removeOutliers,
          });
        case functionEnum.SOLANA_getTokenHoldersChart:
          return await solanaTrackingService.getTokenHoldersChart(args.token, {
            type: args.type,
            time_from: args.time_from,
            time_to: args.time_to,
          });
        case functionEnum.SOLANA_getFirstBuyers:
          return await solanaTrackingService.getFirstBuyers(args.token);

        // Telegram functions
        case functionEnum.TELEGRAM_getChannelMessages:
          return await telegramService.getChannelMessages(args.channelUsername, args.limit);

        default:
          console.error(`[FunctionCall] Unknown function: ${functionName}`);
          throw new Error(`Unknown function: ${functionName}`);
      }
    } catch (error: any) {
      console.error(`[FunctionCall] Error executing function ${functionName}:`, {
        errorName: error.name,
        errorMessage: error.message,
        errorCode: error.code,
        errorType: error.type,
        errorData: error.data,
        errorStack: error.stack,
      });

      if (error.data) {
        console.error(`[FunctionCall] API Error Details:`, {
          detail: error.data.detail,
          title: error.data.title,
          status: error.data.status,
          type: error.data.type,
        });
      }

      throw error;
    }
  }
}

export default FunctionCallService;
