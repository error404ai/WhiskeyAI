"use server";

import TwitterAgentService from "@/http/services/agent/twitterAgentService";

export const twitterTest = async (): Promise<void> => {
  let agent = new TwitterAgentService({ username: "test", password: "test" });
  agent = await agent.login();
  const tweets = await agent.getLatestTweet("elonmusk");
  console.log("tweets are", tweets);
};
