import cron from "node-cron";
import { TriggerSchedulerService } from "../services/agent/TriggerSchedulerService";

// Track running tasks to prevent duplicate executions
const runningTasks = new Set<string>();

const runTask = async () => {
  const taskId = `trigger-task-${Date.now()}`;
  
  // Check if already running
  if (runningTasks.size > 0) {
    console.log("A trigger task is already running, skipping this execution");
    return;
  }
  
  // Add this task to running tasks
  runningTasks.add(taskId);
  
  try {
    console.log("Running scheduled trigger check...");
    const triggerScheduler = new TriggerSchedulerService();
    await triggerScheduler.processPendingTriggers();
  } catch (error) {
    console.error("Error in cron job:", error);
  } finally {
    // Remove task from running tasks
    runningTasks.delete(taskId);
  }
};

// Schedule to run every minute
cron.schedule("* * * * *", () => {
  runTask();
});

console.log("✅ Cron job is running...");
