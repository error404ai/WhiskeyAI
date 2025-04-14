"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ScheduledTweetsTable from "../schedule-tweet/_partials/createSchedule/ScheduledBatchesTable";

const ScheduledBatchesPage = () => {
  const router = useRouter();

  return (
    <div className="container p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Scheduled Posts</h1>
        <Button onClick={() => router.push("/schedule-tweet")} className="bg-blue-600 hover:bg-blue-700">
          Create New Schedule
        </Button>
      </div>

      <ScheduledTweetsTable />
    </div>
  );
};

export default ScheduledBatchesPage;
