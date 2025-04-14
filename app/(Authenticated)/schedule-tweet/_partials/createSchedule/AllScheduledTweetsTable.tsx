/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { DataTable, DataTableRef } from "@/components/Datatable/Datatable";
import { ScheduledTweet } from "@/db/schema";
import * as ScheduledTweetController from "@/server/controllers/ScheduledTweetController";
import { Agent } from "http";
import { useRef } from "react";
import { getScheduledTweetColumns } from "./ScheduledTweetColumns";

export interface ScheduledTweetWithAgent {
  scheduledTweets: ScheduledTweet;
  agents: Agent;
}

const AllScheduledTweetsTable = () => {
  const tableRef = useRef<DataTableRef>(null);
  
  // Use the shared column definitions
  const columns = getScheduledTweetColumns((id) => {
    console.log("Cancel tweet with ID:", id);
    // Add your cancel logic here
  });

  return <DataTable ref={tableRef} columns={columns} serverAction={ScheduledTweetController.getScheduledTweets as any} queryKey="scheduledTweetsList" searchAble={false} />;
};

export default AllScheduledTweetsTable;
