import axios from "axios";
class SolanaTrackerService {
  private axios;
  constructor() {
    this.axios = axios.create({
      headers: {
        "X-API-KEY": process.env.SOLANA_TRACKER_API_KEY,
      },
      baseURL: "https://data.solanatracker.io",
    });
  }

  async getTokenHolders(tokenAddress: string) {
    return this.axios.get(`/tokens/${tokenAddress}/holders`);
  }
}
const solanaTrackerService = new SolanaTrackerService();
export default solanaTrackerService;
