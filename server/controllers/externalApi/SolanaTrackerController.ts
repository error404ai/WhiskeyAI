"use server";

import solanaTrackingService from "@/server/services/externalApi/SolanaTrackingService";

export type SolanaTrackerResponse = {
  status: "success" | "error";
  data?: Record<string, unknown>;
  message?: string;
  errorDetails?: string;
};

const handleSolanaTrackerError = (error: unknown): SolanaTrackerResponse => {
  console.error("Solana Tracker API Error:", error);
  return {
    status: "error",
    message: "Failed to fetch data from Solana Tracker API",
    errorDetails: JSON.stringify(error),
  };
};

export const getTokenHolders = async (tokenAddress: string): Promise<SolanaTrackerResponse> => {
  try {
    const result = await solanaTrackingService.getTokenHolders(tokenAddress);
    return {
      status: "success",
      data: { result },
    };
  } catch (error) {
    return handleSolanaTrackerError(error);
  }
};

export const getTopTokenHolders = async (tokenAddress: string): Promise<SolanaTrackerResponse> => {
  try {
    const result = await solanaTrackingService.getTopTokenHolders(tokenAddress);
    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    return handleSolanaTrackerError(error);
  }
};

export const getLatestTokens = async (): Promise<SolanaTrackerResponse> => {
  try {
    const result = await solanaTrackingService.getLatestTokens();
    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    return handleSolanaTrackerError(error);
  }
};

export const getTrendingTokens = async (): Promise<SolanaTrackerResponse> => {
  try {
    const result = await solanaTrackingService.getTrendingTokens();
    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    return handleSolanaTrackerError(error);
  }
};

export const getTrendingTokensByTimeframe = async (timeframe: string): Promise<SolanaTrackerResponse> => {
  try {
    const result = await solanaTrackingService.getTrendingTokensByTimeframe(timeframe);
    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    return handleSolanaTrackerError(error);
  }
};

export const getTopVolumeTokens = async (): Promise<SolanaTrackerResponse> => {
  try {
    const result = await solanaTrackingService.getTopVolumeTokens();
    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    return handleSolanaTrackerError(error);
  }
};

export const getVolumeTokensByTimeframe = async (timeframe: string): Promise<SolanaTrackerResponse> => {
  try {
    const result = await solanaTrackingService.getVolumeTokensByTimeframe(timeframe);
    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    return handleSolanaTrackerError(error);
  }
};

export const getMultiAllTokens = async (): Promise<SolanaTrackerResponse> => {
  try {
    const result = await solanaTrackingService.getMultiAllTokens();
    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    return handleSolanaTrackerError(error);
  }
};

export const getMultiGraduatedTokens = async (): Promise<SolanaTrackerResponse> => {
  try {
    const result = await solanaTrackingService.getMultiGraduatedTokens();
    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    return handleSolanaTrackerError(error);
  }
};

export const getTokenPrice = async (token: string, priceChanges?: boolean): Promise<SolanaTrackerResponse> => {
  try {
    const result = await solanaTrackingService.getTokenPrice(token, priceChanges);
    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    return handleSolanaTrackerError(error);
  }
};

export const getMultiTokenPrices = async (tokens: string): Promise<SolanaTrackerResponse> => {
  try {
    const result = await solanaTrackingService.getMultiTokenPrices(tokens);
    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    return handleSolanaTrackerError(error);
  }
};

export const getWalletTokens = async (owner: string): Promise<SolanaTrackerResponse> => {
  try {
    const result = await solanaTrackingService.getWalletTokens(owner);
    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    return handleSolanaTrackerError(error);
  }
};

export const getWalletTrades = async (owner: string, cursor?: string): Promise<SolanaTrackerResponse> => {
  try {
    const result = await solanaTrackingService.getWalletTrades(owner, cursor);
    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    return handleSolanaTrackerError(error);
  }
};

export const getTokenChart = async (
  token: string,
  params?: {
    type?: string;
    time_from?: number;
    time_to?: number;
    marketCap?: boolean;
    removeOutliers?: boolean;
  },
): Promise<SolanaTrackerResponse> => {
  try {
    const result = await solanaTrackingService.getTokenChart(token, params);
    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    return handleSolanaTrackerError(error);
  }
};

export const getTokenPoolChart = async (
  token: string,
  pool: string,
  params?: {
    type?: string;
    time_from?: number;
    time_to?: number;
    marketCap?: boolean;
    removeOutliers?: boolean;
  },
): Promise<SolanaTrackerResponse> => {
  try {
    const result = await solanaTrackingService.getTokenPoolChart(token, pool, params);
    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    return handleSolanaTrackerError(error);
  }
};

export const getTokenHoldersChart = async (
  token: string,
  params?: {
    type?: string;
    time_from?: number;
    time_to?: number;
  },
): Promise<SolanaTrackerResponse> => {
  try {
    const result = await solanaTrackingService.getTokenHoldersChart(token, params);
    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    return handleSolanaTrackerError(error);
  }
};

export const getFirstBuyers = async (token: string): Promise<SolanaTrackerResponse> => {
  try {
    const result = await solanaTrackingService.getFirstBuyers(token);
    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    return handleSolanaTrackerError(error);
  }
};
