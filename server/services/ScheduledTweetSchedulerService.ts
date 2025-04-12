import { ScheduledTweetService } from "./ScheduledTweetService";

export class ScheduledTweetSchedulerService {
  constructor() {}

  public async processScheduledTweets(): Promise<void> {
    try {
      console.log("Checking for scheduled tweets to process...");
      
      const pendingTweets = await ScheduledTweetService.getPendingScheduledTweets();

      if (pendingTweets.length === 0) {
        console.log("No scheduled tweets to process");
        return;
      }

      console.log(`Processing ${pendingTweets.length} scheduled tweets`);

      for (const tweet of pendingTweets) {
        try {
          console.log(`\n-----------------------------------------------`);
          console.log(`[Scheduled Tweet] Processing tweet ID: ${tweet.id}`);
          console.log(`[Scheduled Tweet] Agent UUID: ${tweet.agent.uuid}`);
          console.log(`-----------------------------------------------`);

          const success = await ScheduledTweetService.processTweet(tweet);

          if (success) {
            console.log(`[Scheduled Tweet] Successfully processed tweet ${tweet.id}`);
          } else {
            console.error(`[Scheduled Tweet] Failed to process tweet ${tweet.id}`);
          }
          
          console.log(`-----------------------------------------------\n`);
        } catch (error) {
          console.error(`[Scheduled Tweet] Error processing tweet ${tweet.id}:`, error);
        }
      }

      console.log("Finished processing scheduled tweets");
    } catch (error) {
      console.error("Error processing scheduled tweets:", error);
    }
  }
} 