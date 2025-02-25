import { Scraper, Tweet } from "agent-twitter-client";

class TwitterAgentService {
  private readonly scraper: Scraper;
  private readonly username: string;
  private readonly password: string;

  constructor({ username, password }: { username: string; password: string }) {
    this.scraper = new Scraper();
    this.username = username;
    this.password = password;
  }

  async login(): Promise<this> {
    await this.scraper.login(this.username, this.password);
    return this;
  }

  async getLatestTweet(text: string): Promise<void | Tweet | null> {
    return await this.scraper.getLatestTweet(text);
  }
}

export default TwitterAgentService;
