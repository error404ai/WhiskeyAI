import axios from "axios";

class SolanaTrackingService {
  private axios;

  constructor() {
    this.axios = axios.create({
      baseURL: process.env.SOLANA_TRACKING_API_URL || "https://data.solanatracker.io",
      headers: {
        "x-api-key": process.env.SOLANATRACKER_API_KEY || "",
        "Content-Type": "application/json",
      },
    });
  }

  async getTokenHolders(tokenAddress: string) {
    const response = await this.axios.get(`/tokens/${tokenAddress}/holders`);
    return response.data;
  }

  async getTopTokenHolders(tokenAddress: string) {
    const response = await this.axios.get(`/tokens/${tokenAddress}/holders/top`);
    return response.data;
  }

  async getDeployerTokens(wallet: string) {
    const response = await this.axios.get(`/deployer/${wallet}`);
    return response.data;
  }

  async getLatestTokens() {
    const response = await this.axios.get(`/tokens/latest`);
    return response.data;
  }

  async getTrendingTokens() {
    const response = await this.axios.get(`/tokens/trending`);
    return response.data;
  }

  async getTrendingTokensByTimeframe(timeframe: string) {
    const response = await this.axios.get(`/tokens/trending/${timeframe}`);
    return response.data;
  }

  async getTopVolumeTokens() {
    const response = await this.axios.get(`/tokens/volume`);
    return response.data;
  }

  async getVolumeTokensByTimeframe(timeframe: string) {
    const response = await this.axios.get(`/tokens/volume/${timeframe}`);
    return response.data;
  }

  async getMultiAllTokens() {
    const response = await this.axios.get(`/tokens/multi/all`);
    return response.data;
  }

  async getMultiGraduatedTokens() {
    const response = await this.axios.get(`/tokens/multi/graduated`);
    return response.data;
  }

  async getTokenPrice(token: string, priceChanges?: boolean) {
    const response = await this.axios.get(`/price`, {
      params: {
        token,
        priceChanges,
      },
    });
    return response.data;
  }

  async getMultiTokenPrices(tokens: string, priceChanges?: boolean) {
    const response = await this.axios.get(`/price/multi`, {
      params: {
        tokens,
        priceChanges,
      },
    });
    return response.data;
  }

  async getWalletTokens(owner: string) {
    const response = await this.axios.get(`/wallet/${owner}`);
    return response.data;
  }

  async getWalletTrades(owner: string, cursor?: string) {
    const response = await this.axios.get(`/wallet/${owner}/trades`, {
      params: {
        cursor,
      },
    });
    return response.data;
  }

  async getTokenChart(
    token: string,
    params?: {
      type?: string;
      time_from?: number;
      time_to?: number;
      marketCap?: boolean;
      removeOutliers?: boolean;
    },
  ) {
    const response = await this.axios.get(`/chart/${token}`, {
      params,
    });
    return response.data;
  }

  async getTokenPoolChart(
    token: string,
    pool: string,
    params?: {
      type?: string;
      time_from?: number;
      time_to?: number;
      marketCap?: boolean;
      removeOutliers?: boolean;
    },
  ) {
    const response = await this.axios.get(`/chart/${token}/${pool}`, {
      params,
    });
    return response.data;
  }

  async getTokenHoldersChart(
    token: string,
    params?: {
      type?: string;
      time_from?: number;
      time_to?: number;
    },
  ) {
    const response = await this.axios.get(`/holders/chart/${token}`, {
      params,
    });
    return response.data;
  }

  async getFirstBuyers(token: string) {
    const response = await this.axios.get(`/first-buyers/${token}`);
    return response.data;
  }
}

const solanaTrackingService = new SolanaTrackingService();

export default solanaTrackingService;
