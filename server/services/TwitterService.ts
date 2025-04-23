import { AgentPlatform } from "@/server/db/schema";
import { TwitterApi } from "twitter-api-v2";
import { AgentPlatformService } from "./agent/AgentPlatformService";
import { AgentService } from "./agent/AgentService";
import SocialiteService from "./oAuthService/SocialiteService";

class TwitterService {
  private twitterApi: TwitterApi;
  private platform: AgentPlatform;
  private refreshTokenPromise: Promise<void> | null = null;

  constructor(platform: AgentPlatform) {
    this.platform = platform;
    this.twitterApi = new TwitterApi(this.platform.credentials.accessToken);

    // If we received a token but there's no expiryTimestamp, calculate and store it
    if (platform.credentials.expiresIn && !platform.credentials.expiryTimestamp) {
      this.updateTokenExpiry(platform.credentials.expiresIn);
    }
  }

  async getHomeTimeLine() {
    await this.refreshTokenIfNeeded();
    return await this.twitterApi.v2.homeTimeline({
      max_results: 1,
    });
  }

  async postTweet(text: string, mediaUrl?: string) {
    await this.refreshTokenIfNeeded();
    
    if (mediaUrl) {
      try {
        // For tweets with media
        // If your Twitter API supports attaching media, you would implement that here
        // This could involve downloading the media from mediaUrl if needed
        // Depending on the Twitter API version, the implementation may vary
        
        // Example for Twitter API v2 with media_ids (implementation depends on Twitter API capabilities)
        // For demonstration purposes - actual implementation depends on Twitter API
        return await this.twitterApi.v2.tweet(text, {
          media: { media_ids: [mediaUrl] }
        });
      } catch (error) {
        console.error("Error posting tweet with media:", error);
        // Fallback to posting without media if there's an error
        return await this.twitterApi.v2.tweet(text);
      }
    }
    
    // Regular tweet without media
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

  // Update the token expiry timestamp when we get a new token
  private updateTokenExpiry(expiresIn: number): number {
    const expiryTimestamp = Math.floor(Date.now() / 1000) + expiresIn;
    this.platform.credentials.expiryTimestamp = expiryTimestamp;
    return expiryTimestamp;
  }

  private isTokenExpired(): boolean {
    if (!this.platform.credentials.expiryTimestamp) return false;

    // Current time in seconds
    const now = Math.floor(Date.now() / 1000);

    // Consider token expired if less than 5 minutes (300 seconds) left
    return this.platform.credentials.expiryTimestamp - now < 300;
  }

  private async refreshTokenIfNeeded(): Promise<void> {
    if (this.refreshTokenPromise) {
      await this.refreshTokenPromise;
      return;
    }

    if (this.isTokenExpired() && this.platform.credentials.refreshToken) {
      console.log("Refreshing Twitter access token...");
      // Set a promise to prevent multiple concurrent refresh attempts
      this.refreshTokenPromise = (async () => {
        try {
          const agent = await AgentService.getAgentById(this.platform.agentId);
          if (!agent?.twitterClientId || !agent?.twitterClientSecret) {
            throw new Error("Twitter credentials not found for this agent");
          }

          const twitterCredentials = {
            clientId: agent.twitterClientId,
            clientSecret: agent.twitterClientSecret,
          };

          const twitterProvider = new SocialiteService(twitterCredentials).driver("twitter");
          const tokens = await twitterProvider.refreshToken(this.platform.credentials.refreshToken);

          // Update local properties
          this.platform.credentials.accessToken = tokens.accessToken;
          if (tokens.refreshToken) {
            this.platform.credentials.refreshToken = tokens.refreshToken;
          }
          if (tokens.expiresIn) {
            this.platform.credentials.expiresIn = tokens.expiresIn;
            this.platform.credentials.expiryTimestamp = this.updateTokenExpiry(tokens.expiresIn);
          }

          // Update Twitter API client
          this.twitterApi = new TwitterApi(tokens.accessToken);

          // Save the updated credentials to the database
          await AgentPlatformService.updatePlatformCredentials(this.platform.id, this.platform.credentials);
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
}

export default TwitterService;
