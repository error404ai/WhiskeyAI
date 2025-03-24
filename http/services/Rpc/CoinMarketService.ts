import axios from "axios";

class CoinMarketService {
  private endPoint = "https://pro-api.coinmarketcap.com";
  private axios;

  constructor() {
    this.axios = axios.create({
      headers: {
        "X-CMC_PRO_API_KEY": "0246f2f8-67a2-4997-8c03-7a85a7ac2852",
      },
    });
  }

  async getFearAndGreedLatest() {
    return this.axios.get(`${this.endPoint}/v3/fear-and-greed/latest`);
  }
  async getFearAndGreedHistorical() {
    return this.axios.get(`${this.endPoint}/v3/fear-and-greed/historical`);
  }
}

const coinMarketService = new CoinMarketService();
export default coinMarketService;
