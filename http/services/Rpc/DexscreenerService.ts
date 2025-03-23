export class DexscreenerService {
  private dexscreenerEndpoint = "https://api.dexscreener.com";
  async getLatestTokenProfiles() {
    const response = await fetch(this.dexscreenerEndpoint + "/token-profiles/latest/v1", {
      method: "GET",
    });
    const data = await response.json();
    return data;
  }
  async getLatestBoostedTokens() {
    const response = await fetch(this.dexscreenerEndpoint + "/token-boosts/latest/v1", {
      method: "GET",
    });
    const data = await response.json();
    return data;
  }
}

const dexscreenerService = new DexscreenerService();
export default dexscreenerService;
