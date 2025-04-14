"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AllScheduledTweetsTable from "./_partials/createSchedule/AllScheduledTweetsTable";
import CreateSchedule from "./_partials/createSchedule/CreateSchedule";
import ScheduledBatchesTable from "./_partials/createSchedule/ScheduledBatchesTable";

const Page = () => {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-3xl font-bold text-transparent">Schedule Posts</h1>
          <p className="text-muted-foreground text-lg">Create and schedule posts for your AI agents with customizable timing.</p>
        </div>
      </div>
      <Tabs defaultValue="create">
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
    </div>
  );
};

export default Page;
