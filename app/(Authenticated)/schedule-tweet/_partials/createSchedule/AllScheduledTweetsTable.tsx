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
  const queryKey = "scheduledTweetsList";
  
  // Use the shared column definitions with queryKey
  const columns = getScheduledTweetColumns(
    queryKey, 
    (id) => {
      console.log("Tweet cancelled with ID:", id);
      // Refresh is handled in the column component
    },
    (id) => {
      console.log("Tweet deleted with ID:", id);
      // Refresh is handled in the column component
    }
  );

  return <DataTable 
    ref={tableRef} 
    columns={columns} 
    serverAction={ScheduledTweetController.getScheduledTweets as any} 
    queryKey={queryKey} 
    searchAble={false} 
  />;
};

export default AllScheduledTweetsTable;
