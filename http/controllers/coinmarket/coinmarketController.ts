"use server";

import coinMarketService from "@/http/services/Rpc/CoinMarketService";

interface TrendingBaseParams {
  limit?: number;
  start?: number;
  time_period?: "24h" | "30d" | "7d";
  convert?: string;
  convert_id?: string;
}

interface TrendingGainersLosersParams extends TrendingBaseParams {
  sort?: "percent_change_24h";
  sort_dir?: "asc" | "desc";
}

interface QuotesHistoricalParams {
  id: string;
  symbol?: string;
  time_start?: string;
  time_end?: string;
  count?: number;
  interval: "yearly" | "monthly" | "weekly" | "daily" | "hourly" | "5m" | "10m" | "15m" | "30m" | "45m" | "1h" | "2h" | "3h" | "4h" | "6h" | "12h" | "24h" | "1d" | "2d" | "3d" | "7d" | "14d" | "15d" | "30d" | "60d" | "90d" | "365d";
  convert?: string;
  convert_id?: string;
  aux?: string;
  skip_invalid?: boolean;
}

interface QuotesLatestParams {
  id?: string;
  slug?: string;
  symbol?: string;
  convert?: string;
  convert_id?: string;
  aux?: string;
  skip_invalid?: boolean;
}

interface MetadataParams {
  id?: string;
  slug?: string;
  symbol?: string;
  address?: string;
  skip_invalid?: boolean;
  aux?: string;
}

export async function getFearAndGreedLatest() {
  try {
    const response = await coinMarketService.getFearAndGreedLatest();
    return {
      status: "success",
      data: response.data,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to get fear and greed latest",
      errorDetails: error instanceof Error ? error.stack : undefined,
    };
  }
}

export async function getFearAndGreedHistorical() {
  try {
    const response = await coinMarketService.getFearAndGreedHistorical();
    return {
      status: "success",
      data: response.data,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to get fear and greed historical",
      errorDetails: error instanceof Error ? error.stack : undefined,
    };
  }
}

export async function getTrendingMostVisited(params: TrendingBaseParams) {
  try {
    const response = await coinMarketService.getTrendingMostVisited(params);
    return {
      status: "success",
      data: response.data,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to get trending most visited",
      errorDetails: error instanceof Error ? error.stack : undefined,
    };
  }
}

export async function getTrendingGainersLosers(params: TrendingGainersLosersParams) {
  try {
    const response = await coinMarketService.getTrendingGainersLosers(params);
    return {
      status: "success",
      data: response.data,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to get trending gainers & losers",
      errorDetails: error instanceof Error ? error.stack : undefined,
    };
  }
}

export async function getTrendingLatest(params: TrendingBaseParams) {
  try {
    const response = await coinMarketService.getTrendingLatest(params);
    return {
      status: "success",
      data: response.data,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to get trending latest",
      errorDetails: error instanceof Error ? error.stack : undefined,
    };
  }
}

export async function getQuotesHistorical(params: QuotesHistoricalParams) {
  try {
    const response = await coinMarketService.getQuotesHistorical(params);
    return {
      status: "success",
      data: response.data,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to get quotes historical",
      errorDetails: error instanceof Error ? error.stack : undefined,
    };
  }
}

export async function getQuotesLatest(params: QuotesLatestParams) {
  try {
    const response = await coinMarketService.getQuotesLatest(params);
    return {
      status: "success",
      data: response.data,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to get quotes latest",
      errorDetails: error instanceof Error ? error.stack : undefined,
    };
  }
}

export async function getMetadata(params: MetadataParams) {
  try {
    const response = await coinMarketService.getMetadata(params);
    return {
      status: "success",
      data: response.data,
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to get metadata",
      errorDetails: error instanceof Error ? error.stack : undefined,
    };
  }
} 