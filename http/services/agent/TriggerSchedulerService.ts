/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/db/db";
import { Agent, Function, agentPlatformsTable, agentTriggersTable, functionsTable } from "@/db/schema";
import { AgentPlatform } from "@/db/schema/agentPlatformsTable";
import { AgentTrigger } from "@/db/schema/agentTriggersTable";
import TwitterService from "@/http/services/TwitterService";
import { and, eq, lte } from "drizzle-orm";
import { OpenAI } from "openai";

// Add interface for tweet structure
interface Tweet {
  id: string;
  text: string;
}

export class TriggerSchedulerService {
  private openai: OpenAI;

  constructor() {
    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Main method to process all pending triggers
   * This will be called from the cron job
   */
  public async processPendingTriggers(): Promise<void> {
    try {
      // Get all triggers that need to be processed
      const pendingTriggers = await this.getPendingTriggers();

      if (pendingTriggers.length === 0) {
        console.log("No pending triggers to process");
        return;
      }

      console.log(`Processing ${pendingTriggers.length} pending triggers`);

      // Process each trigger
      for (const trigger of pendingTriggers) {
        await this.processTrigger(trigger);
      }
    } catch (error) {
      console.error("Error processing pending triggers:", error);
    }
  }

  /**
   * Get all triggers that are due to be executed
   */
  private async getPendingTriggers() {
    const now = new Date();

    return await db.query.agentTriggersTable.findMany({
      where: and(eq(agentTriggersTable.status, "active"), lte(agentTriggersTable.nextRunAt || new Date(0), now)),
      with: {
        agent: true,
      },
    });
  }

  /**
   * Process a single trigger
   */
  private async processTrigger(trigger: AgentTrigger & { agent: Agent }): Promise<void> {
    try {
      console.log(`Processing trigger: ${trigger.name} (ID: ${trigger.id})`);

      // Get function details
      const functionDetails = await this.getFunctionDetails(trigger.functionName);
      if (!functionDetails) {
        throw new Error(`Function ${trigger.functionName} not found`);
      }

      // Execute the function
      const result = await this.executeFunction(trigger, functionDetails);

      // Update the trigger's last run and next run times
      await this.updateTriggerSchedule(trigger);

      console.log(`Successfully processed trigger ${trigger.id} with result:`, result);
    } catch (error) {
      console.error(`Error processing trigger ${trigger.id}:`, error);

      // Update next run time even if there was an error
      await this.updateTriggerSchedule(trigger);
    }
  }

  /**
   * Get the function details from the database
   */
  private async getFunctionDetails(functionName: string): Promise<Function | undefined> {
    return await db.query.functionsTable.findFirst({
      where: eq(functionsTable.name, functionName),
    });
  }

  /**
   * Execute the function based on its type
   */
  private async executeFunction(trigger: AgentTrigger & { agent: Agent }, functionDetails: Function): Promise<any> {
    console.log(functionDetails);
    
    // Handle each supported function type
    switch(trigger.functionName) {
      case "post_tweet":
        return await this.executePostTweet(trigger);
      case "reply_tweet":
        return await this.executeReplyTweet(trigger);
      case "like_tweet":
        return await this.executeLikeTweet(trigger);
      case "quote_tweet":
        return await this.executeQuoteTweet(trigger);
      case "retweet":
        return await this.executeRetweet(trigger);
      default:
        throw new Error(`Unsupported function: ${trigger.functionName}`);
    }
  }

  /**
   * Execute the post_tweet function
   */
  private async executePostTweet(trigger: AgentTrigger & { agent: Agent }): Promise<any> {
    // Get the agent's Twitter platform
    const platform = await db.query.agentPlatformsTable.findFirst({
      where: and(eq(agentPlatformsTable.agentId, trigger.agentId), eq(agentPlatformsTable.type, "twitter"), eq(agentPlatformsTable.enabled, true)),
    });

    if (!platform) {
      throw new Error("No enabled Twitter platform found for this agent");
    }

    // Generate tweet content using OpenAI
    const tweetContent = await this.generateTweetContent(trigger, platform);

    // Post the tweet using Twitter API
    const twitterService = new TwitterService(platform);
    const result = await twitterService.postTweet(tweetContent);

    return result;
  }

  /**
   * Execute the reply_tweet function
   */
  private async executeReplyTweet(trigger: AgentTrigger & { agent: Agent }): Promise<any> {
    // Get the agent's Twitter platform
    const platform = await db.query.agentPlatformsTable.findFirst({
      where: and(eq(agentPlatformsTable.agentId, trigger.agentId), eq(agentPlatformsTable.type, "twitter"), eq(agentPlatformsTable.enabled, true)),
    });

    if (!platform) {
      throw new Error("No enabled Twitter platform found for this agent");
    }

    // First call getHomeTimeline agent function to retrieve timeline data
    const twitterService = new TwitterService(platform);
    const timeline = await twitterService.getHomeTimeLine();

    // Generate reply content and get tweet ID using OpenAI
    const { text, tweetId } = await this.generateReplyContent(trigger, platform, timeline);

    // Reply to the tweet using Twitter API
    const result = await twitterService.replyTweet(text, tweetId);

    return result;
  }

  /**
   * Execute the like_tweet function
   */
  private async executeLikeTweet(trigger: AgentTrigger & { agent: Agent }): Promise<any> {
    // Get the agent's Twitter platform
    const platform = await db.query.agentPlatformsTable.findFirst({
      where: and(eq(agentPlatformsTable.agentId, trigger.agentId), eq(agentPlatformsTable.type, "twitter"), eq(agentPlatformsTable.enabled, true)),
    });

    if (!platform) {
      throw new Error("No enabled Twitter platform found for this agent");
    }

    // First call getHomeTimeline agent function to retrieve timeline data
    const twitterService = new TwitterService(platform);
    const timeline = await twitterService.getHomeTimeLine();

    // Get tweet ID to like using OpenAI
    const { tweetId } = await this.generateLikeAction(trigger, platform, timeline);

    // Like the tweet using Twitter API
    const result = await twitterService.likeTweet(tweetId);

    return result;
  }

  /**
   * Execute the quote_tweet function
   */
  private async executeQuoteTweet(trigger: AgentTrigger & { agent: Agent }): Promise<any> {
    // Get the agent's Twitter platform
    const platform = await db.query.agentPlatformsTable.findFirst({
      where: and(eq(agentPlatformsTable.agentId, trigger.agentId), eq(agentPlatformsTable.type, "twitter"), eq(agentPlatformsTable.enabled, true)),
    });

    if (!platform) {
      throw new Error("No enabled Twitter platform found for this agent");
    }

    // First call getHomeTimeline agent function to retrieve timeline data
    const twitterService = new TwitterService(platform);
    const timeline = await twitterService.getHomeTimeLine();

    // Generate quote content and get tweet ID using OpenAI
    const { comment, quotedTweetId } = await this.generateQuoteContent(trigger, platform, timeline);

    // Quote the tweet using Twitter API
    const result = await twitterService.quoteTweet(quotedTweetId, comment);

    return result;
  }

  /**
   * Execute the retweet function
   */
  private async executeRetweet(trigger: AgentTrigger & { agent: Agent }): Promise<any> {
    // Get the agent's Twitter platform
    const platform = await db.query.agentPlatformsTable.findFirst({
      where: and(eq(agentPlatformsTable.agentId, trigger.agentId), eq(agentPlatformsTable.type, "twitter"), eq(agentPlatformsTable.enabled, true)),
    });

    if (!platform) {
      throw new Error("No enabled Twitter platform found for this agent");
    }

    // First call getHomeTimeline agent function to retrieve timeline data
    const twitterService = new TwitterService(platform);
    const timeline = await twitterService.getHomeTimeLine();

    // Get tweet ID to retweet using OpenAI
    const { tweetId } = await this.generateRetweetAction(trigger, platform, timeline);

    // Retweet using Twitter API
    const result = await twitterService.reTweet(tweetId);

    return result;
  }

  /**
   * Generate reply content using OpenAI API
   */
  private async generateReplyContent(
    trigger: AgentTrigger & { agent: Agent }, 
    platform: AgentPlatform,
    timeline: any
  ): Promise<{ text: string, tweetId: string }> {
    // Prepare context for the AI
    const context = {
      agentName: trigger.agent.name,
      agentGoal: trigger.agent.information?.goal || "",
      agentDescription: trigger.agent.information?.description || "",
      triggerName: trigger.name,
      triggerDescription: trigger.description,
      informationSource: trigger.informationSource,
      platformName: platform.name,
      twitterHandle: platform.account?.username || "",
    };

    // Use the timeline data that was already retrieved
    const recentTweets = timeline.data.data || [] as Tweet[];

    // Generate content with OpenAI
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant helping to reply to tweets for a Twitter account. 
          Create a reply that aligns with the agent's goals and description. 
          The reply should be engaging, concise and under 280 characters.
          
          Agent information:
          Name: ${context.agentName}
          Goal: ${context.agentGoal}
          Description: ${context.agentDescription}
          
          Trigger information:
          Name: ${context.triggerName}
          Description: ${context.triggerDescription}
          Information Source: ${context.informationSource}
          
          Recent tweets (for context):
          ${recentTweets.map((tweet: Tweet) => `Tweet ID: ${tweet.id}, Content: ${tweet.text}`).join('\n')}`,
        },
        {
          role: "user",
          content: `Based on the provided context and recent tweets, select a tweet to reply to and compose a relevant reply. 
          Return your response in JSON format with 'tweetId' and 'text' fields.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    // Parse the response
    const response = JSON.parse(completion.choices[0].message.content || '{"tweetId": "", "text": ""}');
    
    if (!response.tweetId || !response.text) {
      throw new Error("Failed to generate valid reply content");
    }

    return {
      text: response.text,
      tweetId: response.tweetId
    };
  }

  /**
   * Generate like action using OpenAI API
   */
  private async generateLikeAction(
    trigger: AgentTrigger & { agent: Agent }, 
    platform: AgentPlatform,
    timeline: any
  ): Promise<{ tweetId: string }> {
    // Prepare context for the AI
    const context = {
      agentName: trigger.agent.name,
      agentGoal: trigger.agent.information?.goal || "",
      agentDescription: trigger.agent.information?.description || "",
      triggerName: trigger.name,
      triggerDescription: trigger.description,
      informationSource: trigger.informationSource,
      platformName: platform.name,
      twitterHandle: platform.account?.username || "",
    };

    // Use the timeline data that was already retrieved
    const recentTweets = timeline.data.data || [] as Tweet[];

    // Generate content with OpenAI
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant helping to decide which tweet to like for a Twitter account.
          Choose a tweet to like that aligns with the agent's goals and description.
          
          Agent information:
          Name: ${context.agentName}
          Goal: ${context.agentGoal}
          Description: ${context.agentDescription}
          
          Trigger information:
          Name: ${context.triggerName}
          Description: ${context.triggerDescription}
          Information Source: ${context.informationSource}
          
          Recent tweets (for context):
          ${recentTweets.map((tweet: Tweet) => `Tweet ID: ${tweet.id}, Content: ${tweet.text}`).join('\n')}`,
        },
        {
          role: "user",
          content: `Based on the provided context and recent tweets, select a tweet to like. 
          Return your response in JSON format with a 'tweetId' field.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    // Parse the response
    const response = JSON.parse(completion.choices[0].message.content || '{"tweetId": ""}');
    
    if (!response.tweetId) {
      throw new Error("Failed to generate valid like action");
    }

    return {
      tweetId: response.tweetId
    };
  }

  /**
   * Generate quote content using OpenAI API
   */
  private async generateQuoteContent(
    trigger: AgentTrigger & { agent: Agent }, 
    platform: AgentPlatform,
    timeline: any
  ): Promise<{ comment: string, quotedTweetId: string }> {
    // Prepare context for the AI
    const context = {
      agentName: trigger.agent.name,
      agentGoal: trigger.agent.information?.goal || "",
      agentDescription: trigger.agent.information?.description || "",
      triggerName: trigger.name,
      triggerDescription: trigger.description,
      informationSource: trigger.informationSource,
      platformName: platform.name,
      twitterHandle: platform.account?.username || "",
    };

    // Use the timeline data that was already retrieved
    const recentTweets = timeline.data.data || [] as Tweet[];

    // Generate content with OpenAI
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant helping to quote tweets for a Twitter account.
          Create a quote that aligns with the agent's goals and description. 
          The quote should be engaging, concise and under 280 characters.
          
          Agent information:
          Name: ${context.agentName}
          Goal: ${context.agentGoal}
          Description: ${context.agentDescription}
          
          Trigger information:
          Name: ${context.triggerName}
          Description: ${context.triggerDescription}
          Information Source: ${context.informationSource}
          
          Recent tweets (for context):
          ${recentTweets.map((tweet: Tweet) => `Tweet ID: ${tweet.id}, Content: ${tweet.text}`).join('\n')}`,
        },
        {
          role: "user",
          content: `Based on the provided context and recent tweets, select a tweet to quote and compose a relevant comment. 
          Return your response in JSON format with 'quotedTweetId' and 'comment' fields.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    // Parse the response
    const response = JSON.parse(completion.choices[0].message.content || '{"quotedTweetId": "", "comment": ""}');
    
    if (!response.quotedTweetId || !response.comment) {
      throw new Error("Failed to generate valid quote content");
    }

    return {
      comment: response.comment,
      quotedTweetId: response.quotedTweetId
    };
  }

  /**
   * Generate retweet action using OpenAI API
   */
  private async generateRetweetAction(
    trigger: AgentTrigger & { agent: Agent }, 
    platform: AgentPlatform,
    timeline: any
  ): Promise<{ tweetId: string }> {
    // Prepare context for the AI
    const context = {
      agentName: trigger.agent.name,
      agentGoal: trigger.agent.information?.goal || "",
      agentDescription: trigger.agent.information?.description || "",
      triggerName: trigger.name,
      triggerDescription: trigger.description,
      informationSource: trigger.informationSource,
      platformName: platform.name,
      twitterHandle: platform.account?.username || "",
    };

    // Use the timeline data that was already retrieved
    const recentTweets = timeline.data.data || [] as Tweet[];

    // Generate content with OpenAI
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant helping to decide which tweet to retweet for a Twitter account.
          Choose a tweet to retweet that aligns with the agent's goals and description.
          
          Agent information:
          Name: ${context.agentName}
          Goal: ${context.agentGoal}
          Description: ${context.agentDescription}
          
          Trigger information:
          Name: ${context.triggerName}
          Description: ${context.triggerDescription}
          Information Source: ${context.informationSource}
          
          Recent tweets (for context):
          ${recentTweets.map((tweet: Tweet) => `Tweet ID: ${tweet.id}, Content: ${tweet.text}`).join('\n')}`,
        },
        {
          role: "user",
          content: `Based on the provided context and recent tweets, select a tweet to retweet. 
          Return your response in JSON format with a 'tweetId' field.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    // Parse the response
    const response = JSON.parse(completion.choices[0].message.content || '{"tweetId": ""}');
    
    if (!response.tweetId) {
      throw new Error("Failed to generate valid retweet action");
    }

    return {
      tweetId: response.tweetId
    };
  }

  /**
   * Generate tweet content using OpenAI API
   */
  private async generateTweetContent(trigger: AgentTrigger & { agent: Agent }, platform: AgentPlatform): Promise<string> {
    // Prepare context for the AI
    const context = {
      agentName: trigger.agent.name,
      agentGoal: trigger.agent.information?.goal || "",
      agentDescription: trigger.agent.information?.description || "",
      triggerName: trigger.name,
      triggerDescription: trigger.description,
      informationSource: trigger.informationSource,
      platformName: platform.name,
      twitterHandle: platform.account?.username || "",
    };

    // Generate content with OpenAI
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant helping to generate tweets for a Twitter account. 
          Create a tweet that aligns with the agent's goals and description. 
          The tweet should be engaging, concise and under 280 characters.
          
          Agent information:
          Name: ${context.agentName}
          Goal: ${context.agentGoal}
          Description: ${context.agentDescription}
          
          Trigger information:
          Name: ${context.triggerName}
          Description: ${context.triggerDescription}
          Information Source: ${context.informationSource}`,
        },
        {
          role: "user",
          content: `Generate a tweet for the Twitter account @${context.twitterHandle} based on the provided context.`,
        },
      ],
      max_tokens: 150,
    });

    // Return the generated text
    return completion.choices[0].message.content?.trim() || `Check out this automated tweet from ${context.agentName}!`;
  }

  /**
   * Update the trigger's last run time and calculate the next run time
   */
  private async updateTriggerSchedule(trigger: AgentTrigger): Promise<void> {
    const now = new Date();

    // Calculate next run time based on interval and runEvery
    const nextRunAt = new Date(now);
    if (trigger.runEvery === "minutes") {
      nextRunAt.setMinutes(now.getMinutes() + trigger.interval);
    } else if (trigger.runEvery === "hours") {
      nextRunAt.setHours(now.getHours() + trigger.interval);
    }

    // Update the trigger record
    await db
      .update(agentTriggersTable)
      .set({
        lastRunAt: now,
        nextRunAt: nextRunAt,
      })
      .where(eq(agentTriggersTable.id, trigger.id));
  }
}
