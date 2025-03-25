import axios from "axios";

export class DexscreenerService {
  private endPoint = "https://api.dexscreener.com";
  private axios;

  constructor() {
    this.axios = axios.create();
  }

  async getLatestTokenProfiles() {
    const res = await this.axios.get(`${this.endPoint}/token-profiles/latest/v1`);
    return res.data;
  }

  async getLatestBoostedTokens() {
    const res = await this.axios.get(`${this.endPoint}/token-boosts/latest/v1`);
    return res.data;
  }

  async getTopBoostedTokens() {
    const res = await this.axios.get(`${this.endPoint}/token-boosts/top/v1`);
    return res.data;
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
      params: { q: query }
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
