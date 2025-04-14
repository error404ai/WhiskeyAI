"use client";
import { DataTable, DataTableRef } from "@/components/Datatable/Datatable";
import { DataTableColumnHeader } from "@/components/Datatable/DatatableColumnHeader";
import * as ScheduledTweetController from "@/server/controllers/ScheduledTweetController";
import { ColumnDef } from "@tanstack/react-table";
import { useRef } from "react";
import { ScheduledTweetWithAgent } from "./types";

const ScheduledTweetsTable = () => {
  const tableRef = useRef<DataTableRef>(null);

  // Define columns for the table - ensuring all have proper cell definitions
  const columns: ColumnDef<ScheduledTweetWithAgent>[] = [
    {
      accessorKey: "batchId",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Batch ID" />,
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
