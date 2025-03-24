export class DexscreenerService {
  private dexscreenerEndpoint = "https://api.dexscreener.com";
  async getLatestTokenProfiles() {
    const response = await fetch(this.dexscreenerEndpoint + "/token-profiles/latest/v1", {
      method: "GET",
    });

    const data = await response.json();
    const sortedData = data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => {
        const timestampMatch = item.openGraph.match(/timestamp=(\d+)/);
        const timestamp = timestampMatch ? parseInt(timestampMatch[1], 10) : 0;
        return { ...item, timestamp };
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => b.timestamp - a.timestamp);

    return sortedData.slice(0, 3);
  }
  async getLatestBoostedTokens() {
    const response = await fetch(this.dexscreenerEndpoint + "/token-boosts/latest/v1", {
      method: "GET",
    });
    const data = await response.json();
    const sortedData = data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => {
        const timestampMatch = item.openGraph.match(/timestamp=(\d+)/);
        const timestamp = timestampMatch ? parseInt(timestampMatch[1], 10) : 0;
        return { ...item, timestamp };
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => b.timestamp - a.timestamp);

    return sortedData.slice(0, 3);
  }

  async getTopBoostedTokens() {
    const response = await fetch(this.dexscreenerEndpoint + "/token-boosts/top/v1", {
      method: "GET",
    });
    const data = await response.json();
    return data;
  }

  async getTokenOrders(chainId: string, tokenAddress: string) {
    const response = await fetch(this.dexscreenerEndpoint + `/orders/v1/${chainId}/${tokenAddress}`, {
      method: "GET",
    });
    const data = await response.json();
    return data;
  }

  async getPairsByChainAndPairAddress(chainId: string, pairId: string) {
    const response = await fetch(this.dexscreenerEndpoint + `/latest/dex/pairs/${chainId}/${pairId}`, {
      method: "GET",
    });
    const data = await response.json();
    return data;
  }

  async searchPairs(query: string) {
    const response = await fetch(this.dexscreenerEndpoint + `/latest/dex/search?q=${encodeURIComponent(query)}`, {
      method: "GET",
    });
    const data = await response.json();
    return data;
  }

  async getTokenPairs(chainId: string, tokenAddress: string) {
    const response = await fetch(this.dexscreenerEndpoint + `/token-pairs/v1/${chainId}/${tokenAddress}`, {
      method: "GET",
    });
    const data = await response.json();
    return data;
  }

  async getTokensByAddress(chainId: string, tokenAddresses: string) {
    const response = await fetch(this.dexscreenerEndpoint + `/tokens/v1/${chainId}/${tokenAddresses}`, {
      method: "GET",
    });
    const data = await response.json();
    return data;
  }
}

const dexscreenerService = new DexscreenerService();
export default dexscreenerService;
