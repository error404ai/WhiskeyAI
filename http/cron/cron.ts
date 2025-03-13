import cron from "node-cron";

const runTask = async () => {
  console.log("cron");
};

cron.schedule("* * * * * *", () => {
  runTask();
});

console.log("✅ Cron job is running...");
