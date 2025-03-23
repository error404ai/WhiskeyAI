"use server";
import dexscreenerService from "@/http/services/Rpc/DexscreenerService";
import { DexScreenerResponse } from "@/types/dexscreener";

// Helper function to handle errors - ensuring serializable output
const handleDexscreenerError = (error: unknown): DexScreenerResponse => {
  console.error("Dexscreener API error:", error);

  // Convert the error to a string to ensure serializability
  const errorString = String(error);
  const isRateLimit = errorString.includes("429") || errorString.includes("rate limit");
  
  // Create a serializable error object (no Error instances)
  return {
    status: "error",
    message: isRateLimit 
      ? "Dexscreener API rate limit exceeded. Please wait a few minutes before trying again." 
      : `Dexscreener API error: ${errorString}`,
    isRateLimit,
    // Convert error object to a safe string representation instead of passing the Error instance
    errorDetails: typeof error === 'object' && error !== null 
      ? JSON.stringify(Object.getOwnPropertyNames(error).reduce((acc, key) => {
          // @ts-expect-error - dynamic property access
          acc[key] = String(error[key]);
          return acc;
        }, {} as Record<string, string>))
      : String(error)
  };
};

export const getLatestTokenProfiles = async (): Promise<DexScreenerResponse> => {
  try {
    const result = await dexscreenerService.getLatestTokenProfiles();
    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    return handleDexscreenerError(error);
  }
};

export const getLatestBoostedTokens = async (): Promise<DexScreenerResponse> => {
  try {
    const result = await dexscreenerService.getLatestBoostedTokens();
    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    return handleDexscreenerError(error);
  }
};

export const getTopBoostedTokens = async (): Promise<DexScreenerResponse> => {
  try {
    const result = await dexscreenerService.getTopBoostedTokens();
    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    return handleDexscreenerError(error);
  }
};

export const getTokenOrders = async (chainId: string, tokenAddress: string): Promise<DexScreenerResponse> => {
  try {
    const result = await dexscreenerService.getTokenOrders(chainId, tokenAddress);
    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    return handleDexscreenerError(error);
  }
};

export const getPairsByChainAndPairAddress = async (chainId: string, pairId: string): Promise<DexScreenerResponse> => {
  try {
    const result = await dexscreenerService.getPairsByChainAndPairAddress(chainId, pairId);
    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    return handleDexscreenerError(error);
  }
};

export const searchPairs = async (query: string): Promise<DexScreenerResponse> => {
  try {
    const result = await dexscreenerService.searchPairs(query);
    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    return handleDexscreenerError(error);
  }
};

export const getTokenPairs = async (chainId: string, tokenAddress: string): Promise<DexScreenerResponse> => {
  try {
    const result = await dexscreenerService.getTokenPairs(chainId, tokenAddress);
    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    return handleDexscreenerError(error);
  }
};

export const getTokensByAddress = async (chainId: string, tokenAddresses: string): Promise<DexScreenerResponse> => {
  try {
    const result = await dexscreenerService.getTokensByAddress(chainId, tokenAddresses);
    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    return handleDexscreenerError(error);
  }
}; 