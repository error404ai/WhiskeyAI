import AgentPage from "@/components/commonPages/agentPage/AgentPage";
import AuthenticatedRoute from "@/components/wrappers/AuthenticatedRoute";

const page = () => {
  return (
    <AuthenticatedRoute>
      <AgentPage />
    </AuthenticatedRoute>
  );
};

export default page;
