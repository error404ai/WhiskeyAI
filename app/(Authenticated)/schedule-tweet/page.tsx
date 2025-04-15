"use client";
import NoSsr from "@/components/NoSsr/NoSsr";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AllScheduledTweetsTable from "./_partials/createSchedule/AllScheduledTweetsTable";
import CreateSchedule from "./_partials/createSchedule/CreateSchedule";
import ScheduledBatchesTable from "./_partials/createSchedule/ScheduledBatchesTable";

const Page = () => {
  const params = useSearchParams();
  const [tab, setTab] = useState(params.get("tab") || "create");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tab);
    setTimeout(() => {
      window.history.replaceState(null, "", `?${params.toString()}`);
    }, 0);
  }, [tab]);
  return (
    <NoSsr>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-3xl font-bold text-transparent">Schedule Posts</h1>
          <p className="text-muted-foreground text-lg">Create and schedule posts for your AI agents with customizable timing.</p>
        </div>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="create">Create Schedule</TabsTrigger>
          <TabsTrigger value="scheduledBatches">Scheduled Batches</TabsTrigger>
          <TabsTrigger value="allScheduledTweets">All Schedule Tweets</TabsTrigger>
        </TabsList>
        <TabsContent value="create">
          <CreateSchedule />
        </TabsContent>
        <TabsContent value="scheduledBatches">
          <ScheduledBatchesTable />
        </TabsContent>
        <TabsContent value="allScheduledTweets">
          <AllScheduledTweetsTable />
        </TabsContent>
      </Tabs>
    </NoSsr>
  );
};

export default Page;
