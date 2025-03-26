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
  return await coinMarketService.getFearAndGreedLatest();
}

export async function getFearAndGreedHistorical() {
  return await coinMarketService.getFearAndGreedHistorical();
}

export async function getTrendingMostVisited(params: TrendingBaseParams) {
  return await coinMarketService.getTrendingMostVisited(params);
}

export async function getTrendingGainersLosers(params: TrendingGainersLosersParams) {
  return await coinMarketService.getTrendingGainersLosers(params);
}

export async function getTrendingLatest(params: TrendingBaseParams) {
  return await coinMarketService.getTrendingLatest(params);
}

export async function getQuotesHistorical(params: QuotesHistoricalParams) {
  return await coinMarketService.getQuotesHistorical(params);
}

export async function getQuotesLatest(params: QuotesLatestParams) {
  return await coinMarketService.getQuotesLatest(params);
}

export async function getMetadata(params: MetadataParams) {
  return await coinMarketService.getMetadata(params);
}
