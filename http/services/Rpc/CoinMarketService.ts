import axios from "axios";

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

class CoinMarketService {
  private endPoint = "https://pro-api.coinmarketcap.com";
  private axios;

  constructor() {
    this.axios = axios.create({
      headers: {
        "X-CMC_PRO_API_KEY": process.env.COINMARKET_API_KEY,
      },
    });
  }

  async getFearAndGreedLatest() {
    const res = await this.axios.get(`${this.endPoint}/v3/fear-and-greed/latest`);
    console.log("getFearAndGreedLatest response ==========", res.data);
    return res.data;
  }

  async getFearAndGreedHistorical() {
    const res = await this.axios.get(`${this.endPoint}/v3/fear-and-greed/historical`);

    return res.data;
  }

  async getTrendingMostVisited(params?: TrendingBaseParams) {
    return (await this.axios.get(`${this.endPoint}/v1/cryptocurrency/trending/most-visited`, { params })).data;
  }

  async getTrendingGainersLosers(params?: TrendingGainersLosersParams) {
    return (await this.axios.get(`${this.endPoint}/v1/cryptocurrency/trending/gainers-losers`, { params })).data;
  }

  async getTrendingLatest(params?: TrendingBaseParams) {
    return (await this.axios.get(`${this.endPoint}/v1/cryptocurrency/trending/latest`, { params })).data;
  }

  async getQuotesHistorical(params: QuotesHistoricalParams) {
    return (await this.axios.get(`${this.endPoint}/v2/cryptocurrency/quotes/historical`, { params })).data;
  }

  async getQuotesLatest(params: QuotesLatestParams) {
    return (await this.axios.get(`${this.endPoint}/v2/cryptocurrency/quotes/latest`, { params })).data;
  }

  async getMetadata(params: MetadataParams) {
    return (await this.axios.get(`${this.endPoint}/v2/cryptocurrency/info`, { params })).data;
  }
}

const coinMarketService = new CoinMarketService();
export default coinMarketService;
