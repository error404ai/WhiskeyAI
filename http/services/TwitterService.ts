import { AgentPlatform } from "@/db/schema";
import { TwitterApi } from "twitter-api-v2";

class TwitterService {
  private twitterApi: TwitterApi;
  private platform: AgentPlatform;

  constructor(platform: AgentPlatform) {
    this.platform = platform;
    this.twitterApi = new TwitterApi(this.platform.credentials.accessToken);
  }

  async getHomeTimeLine() {
    return await this.twitterApi.v2.homeTimeline();
  }

  async postTweet(text: string) {
    return await this.twitterApi.v2.tweet(text);
  }

  async replyTweet(text: string, tweetId: string) {
    return await this.twitterApi.v2.reply(text, tweetId);
  }

  async likeTweet(tweetId: string) {
    return await this.twitterApi.v2.like(this.platform.account.id, tweetId);
  }

  async quoteTweet(quotedTweetId: string, comment: string) {
    const tweet = await this.twitterApi.v2.tweet(comment, { quote_tweet_id: quotedTweetId });
    return tweet.data;
  }

  async reTweet(tweetId: string) {
    const retweet = await this.twitterApi.v2.retweet(this.platform.account.id, tweetId);
    return retweet.data;
  }

  async searchTwitter(query: string) {
    return await this.twitterApi.v2.search(query);
  }
}

export default TwitterService;
