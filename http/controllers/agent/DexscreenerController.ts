"use server";
import dexscreenerService from "@/http/services/Rpc/DexscreenerService";
import { DexScreenerResponse } from "@/types/dexscreener";

export const getLatestTokenProfiles = async (): Promise<DexScreenerResponse> => {
  return await dexscreenerService.getLatestTokenProfiles();
};

export const getLatestBoostedTokens = async (): Promise<DexScreenerResponse> => {
  return await dexscreenerService.getLatestBoostedTokens();
};

export const getTopBoostedTokens = async (): Promise<DexScreenerResponse> => {
  return await dexscreenerService.getTopBoostedTokens();
};

export const getTokenOrders = async (chainId: string, tokenAddress: string): Promise<DexScreenerResponse> => {
  return await dexscreenerService.getTokenOrders(chainId, tokenAddress);
};

export const getPairsByChainAndPairAddress = async (chainId: string, pairId: string): Promise<DexScreenerResponse> => {
  return await dexscreenerService.getPairsByChainAndPairAddress(chainId, pairId);
};

export const searchPairs = async (query: string): Promise<DexScreenerResponse> => {
  return await dexscreenerService.searchPairs(query);
};

export const getTokenPairs = async (chainId: string, tokenAddress: string): Promise<DexScreenerResponse> => {
  return await dexscreenerService.getTokenPairs(chainId, tokenAddress);
};

export const getTokensByAddress = async (chainId: string, tokenAddresses: string): Promise<DexScreenerResponse> => {
  return await dexscreenerService.getTokensByAddress(chainId, tokenAddresses);
};
