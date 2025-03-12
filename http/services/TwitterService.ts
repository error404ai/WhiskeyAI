import { AgentPlatform } from "@/db/schema";
import { TwitterApi } from "twitter-api-v2";
import { AgentPlatformService } from "./agent/AgentPlatformService";
import { SocialiteService } from "./oAuthService/SocialiteService";

class TwitterService {
  private twitterApi: TwitterApi;
  private platform: AgentPlatform;
  private tokenExpiryTime?: Date;
  private refreshTokenPromise: Promise<void> | null = null;

  constructor(platform: AgentPlatform) {
    this.platform = platform;
    this.twitterApi = new TwitterApi(this.platform.credentials.accessToken);

    // If we have expiresIn data, calculate the expiry time
    if (platform.credentials.expiresIn) {
      this.tokenExpiryTime = new Date();
      this.tokenExpiryTime.setSeconds(this.tokenExpiryTime.getSeconds() + platform.credentials.expiresIn);
    }
  }

  private isTokenExpired(): boolean {
    if (!this.tokenExpiryTime) return false;
    // Consider token expired if less than 5 minutes left
    const fiveMinutesFromNow = new Date();
    fiveMinutesFromNow.setMinutes(fiveMinutesFromNow.getMinutes() + 5);
    return this.tokenExpiryTime < fiveMinutesFromNow;
  }

  private async refreshTokenIfNeeded(): Promise<void> {
    // If another request is already refreshing the token, wait for it
    if (this.refreshTokenPromise) {
      await this.refreshTokenPromise;
      return;
    }

    if (this.isTokenExpired() && this.platform.credentials.refreshToken) {
      // Set a promise to prevent multiple concurrent refresh attempts
      this.refreshTokenPromise = (async () => {
        try {
          const twitterProvider = new SocialiteService().driver("twitter");
          const tokens = await twitterProvider.refreshToken(this.platform.credentials.refreshToken);

          // Update local properties
          this.platform.credentials.accessToken = tokens.accessToken;
          if (tokens.refreshToken) {
            this.platform.credentials.refreshToken = tokens.refreshToken;
          }

          // Update Twitter API client
          this.twitterApi = new TwitterApi(tokens.accessToken);

          // Update expiry time if provided
          if (tokens.expiresIn) {
            this.tokenExpiryTime = new Date();
            this.tokenExpiryTime.setSeconds(this.tokenExpiryTime.getSeconds() + tokens.expiresIn);
          }

          // Save the updated credentials to the database
          await AgentPlatformService.updatePlatformCredentials(this.platform.id, {
            accessToken: tokens.accessToken,
            refreshToken: this.platform.credentials.refreshToken,
            expiresIn: tokens.expiresIn ?? 0,
          });
        } catch (error) {
          console.error("Failed to refresh token:", error);
          throw new Error(`Failed to refresh Twitter access token: ${(error as Error).message}`);
        } finally {
          this.refreshTokenPromise = null;
        }
      })();

      await this.refreshTokenPromise;
    }
  }

  async postTweet(text: string) {
    await this.refreshTokenIfNeeded();
    return await this.twitterApi.v2.tweet(text);
  }

  async replyTweet(text: string, tweetId: string) {
    await this.refreshTokenIfNeeded();
    return await this.twitterApi.v2.reply(text, tweetId);
  }

  async likeTweet(tweetId: string) {
    await this.refreshTokenIfNeeded();
    return await this.twitterApi.v2.like(this.platform.account.id, tweetId);
  }

  async quoteTweet(quotedTweetId: string, comment: string) {
    await this.refreshTokenIfNeeded();
    const tweet = await this.twitterApi.v2.tweet(comment, { quote_tweet_id: quotedTweetId });
    return tweet.data;
  }

  async reTweet(tweetId: string) {
    await this.refreshTokenIfNeeded();
    const retweet = await this.twitterApi.v2.retweet(this.platform.account.id, tweetId);
    return retweet.data;
  }
}

export default TwitterService;
