"use client";
import { DataTable, DataTableRef } from "@/components/Datatable/Datatable";
import { DataTableColumnHeader } from "@/components/Datatable/DatatableColumnHeader";
import * as ScheduledTweetController from "@/server/controllers/ScheduledTweetController";
import { ColumnDef } from "@tanstack/react-table";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ScheduledTweetWithAgent } from "./types";

const ScheduledTweetsTable = () => {
  const tableRef = useRef<DataTableRef>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle deleting a scheduled tweet
  const handleDeleteTweet = async (tweetId: number) => {
    try {
      setIsDeleting(true);

      // Show loading toast
      toast.loading("Deleting tweet...");

      const response = await ScheduledTweetController.deleteScheduledTweet(tweetId);

      // Dismiss loading toast
      toast.dismiss();

      if (response.success) {
        toast.success("Tweet deleted successfully");
        // Refresh the table
        if (tableRef.current) {
          tableRef.current.refetch();
        }
      } else {
        toast.error(response.message || "Failed to delete tweet");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Error deleting tweet");
      console.error("Error deleting tweet:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Define columns for the table - ensuring all have proper cell definitions
  const columns: ColumnDef<ScheduledTweetWithAgent>[] = [
    {
      accessorKey: "batchId",
      header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
      size: 60,
      enableSorting: false,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      size: 60,
      enableSorting: false,
    },
  ];

  return <DataTable ref={tableRef} columns={columns} serverAction={ScheduledTweetController.getScheduledTweets} queryKey="scheduledTweetsList" searchAble={true} />;
};

export default ScheduledTweetsTable;
