import { auth } from "@/auth";
import AgentPage from "@/components/commonPages/agentPage/AgentPage";
import { redirect } from "next/navigation";

export default async function page() {
  const session = await auth();
  if (session) {
    return redirect("/my-agent");
  }
  return <AgentPage />;
}
