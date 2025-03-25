export enum functionEnum {
  get_home_timeline = "get_home_timeline",
  post_tweet = "post_tweet",
  reply_tweet = "reply_tweet",
  like_tweet = "like_tweet",
  quote_tweet = "quote_tweet",
  retweet = "retweet",
  RPC_getAccountInfo = "RPC_getAccountInfo",
  RPC_getBalance = "RPC_getBalance",
  RPC_getBlock = "RPC_getBlock",
  DEX_getLatestTokenProfiles = "DEX_getLatestTokenProfiles",
  DEX_getLatestBoostedTokens = "DEX_getLatestBoostedTokens",
  DEX_getTopBoostedTokens = "DEX_getTopBoostedTokens",
  DEX_getTokenOrders = "DEX_getTokenOrders",
  DEX_getPairsByChainAndPairAddress = "DEX_getPairsByChainAndPairAddress",
  DEX_searchPairs = "DEX_searchPairs",
  DEX_getTokenPairs = "DEX_getTokenPairs",
  DEX_getTokensByAddress = "DEX_getTokensByAddress",
  COINMARKET_getFearAndGreedLatest = "COINMARKET_getFearAndGreedLatest",
  COINMARKET_getFearAndGreedHistorical = "COINMARKET_getFearAndGreedHistorical",
  COINMARKET_getTrendingMostVisited = "COINMARKET_getTrendingMostVisited",
  COINMARKET_getTrendingGainersLosers = "COINMARKET_getTrendingGainersLosers",
  COINMARKET_getTrendingLatest = "COINMARKET_getTrendingLatest",
  COINMARKET_getQuotesHistorical = "COINMARKET_getQuotesHistorical",
  COINMARKET_getQuotesLatest = "COINMARKET_getQuotesLatest",
  COINMARKET_getMetadata = "COINMARKET_getMetadata",
  // Solana Tracking APIs
  SOLANA_getTokenHolders = "SOLANA_getTokenHolders",
  SOLANA_getTopTokenHolders = "SOLANA_getTopTokenHolders",
  SOLANA_getDeployerTokens = "SOLANA_getDeployerTokens",
  SOLANA_getLatestTokens = "SOLANA_getLatestTokens",
  SOLANA_getTrendingTokens = "SOLANA_getTrendingTokens",
  SOLANA_getTrendingTokensByTimeframe = "SOLANA_getTrendingTokensByTimeframe",
  SOLANA_getTopVolumeTokens = "SOLANA_getTopVolumeTokens",
  SOLANA_getVolumeTokensByTimeframe = "SOLANA_getVolumeTokensByTimeframe",
  SOLANA_getMultiAllTokens = "SOLANA_getMultiAllTokens",
  SOLANA_getMultiGraduatedTokens = "SOLANA_getMultiGraduatedTokens",
  SOLANA_getTokenPrice = "SOLANA_getTokenPrice",
  SOLANA_getMultiTokenPrices = "SOLANA_getMultiTokenPrices",
  SOLANA_getWalletTokens = "SOLANA_getWalletTokens",
  SOLANA_getWalletTrades = "SOLANA_getWalletTrades",
  SOLANA_getTokenChart = "SOLANA_getTokenChart",
  SOLANA_getTokenPoolChart = "SOLANA_getTokenPoolChart",
  SOLANA_getTokenHoldersChart = "SOLANA_getTokenHoldersChart",
  SOLANA_getFirstBuyers = "SOLANA_getFirstBuyers",
}
