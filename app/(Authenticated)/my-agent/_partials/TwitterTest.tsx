"use client";
import { Button } from "@/components/ui/button";
import { twitterTest } from "@/http/controllers/agent/twitterAgentController";

const TwitterTest = () => {
  return <Button onClick={twitterTest}>Hit Twitter</Button>;
};

export default TwitterTest;
