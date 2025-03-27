/* eslint-disable @typescript-eslint/no-explicit-any */
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
    return `Total number of token holders is:  ${response.data.total}`;
  }

  async getTopTokenHolders(tokenAddress: string) {
    const response = await this.axios.get(`/tokens/${tokenAddress}/holders/top`);
    return response.data.slice(0, 10);
  }

  async getLatestTokens() {
    const response = await this.axios.get(`/tokens/latest`);
    const data = response.data.slice(0, 10);
    return data.map((item: any) => ({
      name: item.token.name,
      symbol: item.token.symbol,
      mint: item.token.mint,
      price: item.pools[0].price.usd,
    }));
  }

  async getTrendingTokens() {
    const response = await this.axios.get(`/tokens/trending`);
    const data = response.data.slice(0, 10);
    return data.map((item: any) => ({
      name: item.token.name,
      symbol: item.token.symbol,
      mint: item.token.mint,
      price: item.pools[0].price.usd,
    }));
  }

  async getTrendingTokensByTimeframe(timeframe: string) {
    const response = await this.axios.get(`/tokens/trending/${timeframe}`);
    const data = response.data.slice(0, 10);
    return data.map((item: any) => ({
      name: item.token.name,
      symbol: item.token.symbol,
      mint: item.token.mint,
      price: item.pools[0].price.usd,
    }));
  }
  async getTopVolumeTokens() {
    const response = await this.axios.get(`/tokens/volume`);
    const data = response.data.slice(0, 10);
    return data.map((item: any) => ({
      name: item.token.name,
      symbol: item.token.symbol,
      mint: item.token.mint,
      price: item.pools[0].price.usd,
    }));
  }

  async getVolumeTokensByTimeframe(timeframe: string) {
    const response = await this.axios.get(`/tokens/volume/${timeframe}`);
    const data = response.data.slice(0, 10);
    return data.map((item: any) => ({
      name: item.token.name,
      symbol: item.token.symbol,
      mint: item.token.mint,
      price: item.pools[0].price.usd,
    }));
  }

  async getMultiAllTokens() {
    const response = await this.axios.get(`/tokens/multi/all`);
    const data = response.data;
    return data.latest.slice(0, 10).map((item: any) => ({
      name: item.token.name,
      symbol: item.token.symbol,
      mint: item.token.mint,
      price: item.pools[0].price.usd,
    }));
  }

  async getMultiGraduatedTokens() {
    const response = await this.axios.get(`/tokens/multi/graduated`);
    const data = response.data.slice(0, 10);
    return data.map((item: any) => ({
      name: item.token.name,
      symbol: item.token.symbol,
      mint: item.token.mint,
      price: item.pools[0].price.usd,
    }));
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

  async getMultiTokenPrices(tokens: string) {
    const response = await this.axios.get(`/price/multi`, {
      params: {
        tokens,
      },
    });
    return response.data;
  }

  async getWalletTokens(owner: string) {
    const response = await this.axios.get(`/wallet/${owner}`);
    return response.data.tokens.slice(0, 10).map((item: any) => ({
      name: item.token.name,
      symbol: item.token.symbol,
      mint: item.token.mint,
    }));
  }

  async getWalletTrades(owner: string, cursor?: string) {
    const response = await this.axios.get(`/wallet/${owner}/trades`, {
      params: {
        cursor,
      },
    });
    return response.data.trades.slice(0, 10).map((trade: any) => ({
      tx: trade.tx,
      from: {
        address: trade.from.address,
        amount: trade.from.amount,
        symbol: trade.from.token.symbol,
      },
      to: {
        address: trade.to.address,
        amount: trade.to.amount,
        symbol: trade.to.token.symbol,
      },
    }));
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
