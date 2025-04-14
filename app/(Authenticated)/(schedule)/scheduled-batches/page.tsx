"use client";

import { Button } from "@/components/ui/button";
import ScheduledTweetsTable from "../schedule-tweet/_partials/ScheduledTweetsTable";
import { useRouter } from "next/navigation";

const ScheduledBatchesPage = () => {
  const router = useRouter();
  
  return (
    <div className="container p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Scheduled Posts</h1>
        <Button 
          onClick={() => router.push("/schedule-tweet")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Create New Schedule
        </Button>
      </div>
      
      <ScheduledTweetsTable />
    </div>
  );
};

export default ScheduledBatchesPage;
