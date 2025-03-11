import { Button } from "@/components/ui/button";
import * as TwitterAgentController from "@/http/controllers/agent/TwitterAgentController";
import { useParams } from "next/navigation";

const TwitterAgentTest = () => {
  const agentUuid = useParams().id as string;

  const handleGetTwitterTimeline = async () => {
    const res = await TwitterAgentController.postTweet(agentUuid, "Test tweet from agent");
    console.log("home timeline", res);
  };

  return (
    <div>
      <Button onClick={handleGetTwitterTimeline}>Test Twitter</Button>
    </div>
  );
};

export default TwitterAgentTest;
