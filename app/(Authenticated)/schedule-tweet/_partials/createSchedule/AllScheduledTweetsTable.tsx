/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { DataTable, DataTableRef } from "@/components/Datatable/Datatable";
import { DataTableColumnHeader } from "@/components/Datatable/DatatableColumnHeader";
import { ActionButtons } from "@/components/ui/action-buttons";
import { Badge } from "@/components/ui/badge";
import { DateTime } from "@/components/ui/datetime";
import { ScheduledTweet } from "@/db/schema";
import * as ScheduledTweetController from "@/server/controllers/ScheduledTweetController";
import { ColumnDef } from "@tanstack/react-table";
import { Agent } from "http";
import { AlertCircle, CheckCircle2, Clock, Trash } from "lucide-react";
import { useRef } from "react";
import ErrorMessage from "./ErrorMessage";

export interface ScheduledTweetWithAgent {
  scheduledTweets: ScheduledTweet;
  agents: Agent;
}

const AllScheduledTweetsTable = () => {
  const tableRef = useRef<DataTableRef>(null);
  const columns: ColumnDef<ScheduledTweetWithAgent>[] = [
    {
      accessorKey: "scheduledTweets.batchId",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Batch ID" />,
      size: 60,
      enableSorting: false,
    },
    {
      accessorKey: "agents.name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Agent Name" />,
      size: 60,
      enableSorting: false,
    },
    {
      accessorKey: "scheduledTweets.content",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Content" />,
      size: 60,
      enableSorting: false,
    },
    {
      accessorKey: "scheduledTweets.scheduledAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Scheduled At" />,
      size: 80,
      enableSorting: false,
      cell: ({ row }) => <DateTime date={row.original.scheduledTweets?.scheduledAt} variant="twoLine" showRelative={false} />,
    },
    {
      accessorKey: "scheduledTweets.processedAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Processed At" />,
      size: 80,
      enableSorting: false,
      cell: ({ row }) => {
        const date = row.original.scheduledTweets?.processedAt;
        if (!date) return <span className="text-muted-foreground text-xs">Not processed</span>;
        return <DateTime date={date} variant="twoLine" showRelative={false} />;
      },
    },
    {
      accessorKey: "scheduledTweets.errorMessage",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Error Message" />,
      size: 120,
      enableSorting: false,
      cell: ({ row }) => <ErrorMessage message={row.original.scheduledTweets?.errorMessage} />,
    },
    {
      accessorKey: "scheduledTweets.status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      size: 80,
      enableSorting: false,
      cell: ({ row }) => {
        const status = row.original.scheduledTweets?.status;
        if (!status) {
          return <div className="text-center">-</div>;
        }
        let variant: "default" | "success" | "destructive" | "warning" = "default";
        let icon = null;
        const label = status?.charAt(0).toUpperCase() + status?.slice(1);

        switch (status) {
          case "pending":
            variant = "warning";
            icon = <Clock className="mr-1 h-3 w-3" />;
            break;
          case "completed":
            variant = "success";
            icon = <CheckCircle2 className="mr-1 h-3 w-3" />;
            break;
          case "failed":
            variant = "destructive";
            icon = <AlertCircle className="mr-1 h-3 w-3" />;
            break;
        }

        return (
          <Badge variant={variant} className="flex w-fit items-center justify-center px-2 py-1">
            {icon}
            {label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "scheduledTweets.createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      size: 60,
      enableSorting: false,
      cell: ({ row }) => <DateTime date={row.original.scheduledTweets?.createdAt} />,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const data = row.original;

        return (
          <div className="flex justify-end">
            <ActionButtons
              actions={[
                {
                  label: "Cancel",
                  onClick: () => {
                    console.log("Delete tweet", data.scheduledTweets.id);
                  },
                  icon: <Trash className="h-4 w-4" />,
                  variant: "destructive",
                  disabled: data?.scheduledTweets?.status !== "pending",
                },
              ]}
            />
          </div>
        );
      },
    },
  ];

  return <DataTable ref={tableRef} columns={columns} serverAction={ScheduledTweetController.getScheduledTweets as any} queryKey="scheduledTweetsList" searchAble={false} />;
};

export default AllScheduledTweetsTable;
