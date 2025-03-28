import cron from "node-cron";
import { TriggerSchedulerService } from "../services/agent/TriggerSchedulerService";

const runTask = async () => {
  try {
    console.log("Started processing pending triggers ================================================");
    const triggerScheduler = new TriggerSchedulerService();
    await triggerScheduler.processPendingTriggers();
  } catch (error) {
    console.error("Error in cron job:", error);
  }
};

// Schedule to run every minute
cron.schedule("* * * * *", () => {
  runTask();
});

console.log("✅ Scheduler is running...");
