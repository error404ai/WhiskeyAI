/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export class DexscreenerService {
  private endPoint = "https://api.dexscreener.com";
  private axios;

  constructor() {
    this.axios = axios.create();
  }

  async getLatestTokenProfiles() {
    const res = await this.axios.get(`${this.endPoint}/token-profiles/latest/v1`);
    return res.data.slice(0, 10).map((item: any) => {
      const websiteLink = item.links?.find((link: any) => link.label === "Website")?.url;
      const twitterLink = item.links?.find((link: any) => link.type === "twitter")?.url;
      const telegramLink = item.links?.find((link: any) => link.type === "telegram")?.url;

      return {
        url: item.url,
        address: item.tokenAddress,
        description: item.description,
        twitter: twitterLink || null,
        telegram: telegramLink || null,
        website: websiteLink || null,
      };
    });
  }

  async getLatestBoostedTokens() {
    const res = await this.axios.get(`${this.endPoint}/token-boosts/latest/v1`);
    return res.data.slice(0, 10).map((item: any) => {
      const websiteLink = item.links?.find((link: any) => link.label === "Website")?.url;
      const twitterLink = item.links?.find((link: any) => link.type === "twitter")?.url;
      const telegramLink = item.links?.find((link: any) => link.type === "telegram")?.url;

      return {
        url: item.url,
        address: item.tokenAddress,
        description: item.description,
        twitter: twitterLink || null,
        telegram: telegramLink || null,
        website: websiteLink || null,
      };
    });
  }

  async getTopBoostedTokens() {
    const res = await this.axios.get(`${this.endPoint}/token-boosts/top/v1`);
    return res.data.slice(0, 10).map((item: any) => {
      const websiteLink = item.links?.find((link: any) => link.label === "Website")?.url;
      const twitterLink = item.links?.find((link: any) => link.type === "twitter")?.url;
      const telegramLink = item.links?.find((link: any) => link.type === "telegram")?.url;

      return {
        url: item.url,
        address: item.tokenAddress,
        description: item.description,
        twitter: twitterLink || null,
        telegram: telegramLink || null,
        website: websiteLink || null,
      };
    });
  }

  async getTokenOrders(chainId: string, tokenAddress: string) {
    const res = await this.axios.get(`${this.endPoint}/orders/v1/${chainId}/${tokenAddress}`);
    return res.data;
  }

  async getPairsByChainAndPairAddress(chainId: string, pairId: string) {
    const res = await this.axios.get(`${this.endPoint}/latest/dex/pairs/${chainId}/${pairId}`);
    return res.data;
  }

  async searchPairs(query: string) {
    const res = await this.axios.get(`${this.endPoint}/latest/dex/search`, {
      params: { q: query },
    });
    return res.data;
  }

  async getTokenPairs(chainId: string, tokenAddress: string) {
    const res = await this.axios.get(`${this.endPoint}/token-pairs/v1/${chainId}/${tokenAddress}`);
    return res.data;
  }

  async getTokensByAddress(chainId: string, tokenAddresses: string) {
    const res = await this.axios.get(`${this.endPoint}/tokens/v1/${chainId}/${tokenAddresses}`);
    return res.data;
  }
}

const dexscreenerService = new DexscreenerService();
export default dexscreenerService;
