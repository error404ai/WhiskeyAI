import cron from "node-cron";

const runTask = () => {
  console.log("⏳ Running scheduled task at", new Date().toLocaleTimeString());
};

cron.schedule("* * * * *", () => {
  runTask();
});

console.log("✅ Cron job is running...");
