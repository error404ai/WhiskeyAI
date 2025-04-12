import cron from "node-cron";
import { TriggerSchedulerService } from "../services/agent/TriggerSchedulerService";
import { ScheduledTweetSchedulerService } from "../services/ScheduledTweetSchedulerService";

const runTask = async () => {
  try {
    console.log("Started processing pending triggers ================================================");
    const triggerScheduler = new TriggerSchedulerService();
    await triggerScheduler.processPendingTriggers();
    
    console.log("Started processing scheduled tweets ================================================");
    const tweetScheduler = new ScheduledTweetSchedulerService();
    await tweetScheduler.processScheduledTweets();
  } catch (error) {
    console.error("Error in cron job:", error);
  }
};

// Schedule to run every minute
cron.schedule("* * * * *", () => {
  runTask();
});

console.log("✅ Scheduler is running...");
