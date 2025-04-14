/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { DataTable, DataTableRef } from "@/components/Datatable/Datatable";
import { DataTableColumnHeader } from "@/components/Datatable/DatatableColumnHeader";
import { ActionButtons } from "@/components/ui/action-buttons";
import { Badge } from "@/components/ui/badge";
import { DateTime } from "@/components/ui/datetime";
import * as ScheduledTweetController from "@/server/controllers/ScheduledTweetController";
import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Clock, Edit, Eye, AlertCircle, Trash } from "lucide-react";
import { useRef } from "react";
import { ScheduledTweetWithAgent } from "./_partials/types";

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
      accessorKey: "scheduledTweets.status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      size: 80,
      enableSorting: false,
      cell: ({ row }) => {
        const status: "pending" | "completed" | "failed" | null = row.original.scheduledTweets?.status;
        if (status === null) {
          return <div className="text-center">-</div>;
        }

        let variant: "default" | "success" | "destructive" | "warning" = "default";
        let icon = null;
        const label = status.charAt(0).toUpperCase() + status.slice(1);

        switch (status) {
          case "pending":
            variant = "warning";
            icon = <Clock className="h-3 w-3 mr-1" />;
            break;
          case "completed":
            variant = "success";
            icon = <CheckCircle2 className="h-3 w-3 mr-1" />;
            break;
          case "failed":
            variant = "destructive";
            icon = <AlertCircle className="h-3 w-3 mr-1" />;
            break;
        }

        return (
          <Badge variant={variant} className="flex items-center justify-center px-2 py-1 w-fit">
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
                  label: "View",
                  onClick: () => {
                    // View action logic
                    console.log("View tweet", data.scheduledTweets.id);
                  },
                  icon: <Eye className="h-4 w-4" />,
                },
                {
                  label: "Edit",
                  onClick: () => {
                    // Edit action logic
                    console.log("Edit tweet", data.scheduledTweets.id);
                  },
                  icon: <Edit className="h-4 w-4" />,
                  disabled: data.scheduledTweets.status === "completed",
                },
                {
                  label: "Delete",
                  onClick: () => {
                    // Delete action logic
                    console.log("Delete tweet", data.scheduledTweets.id);
                  },
                  icon: <Trash className="h-4 w-4" />,
                  variant: "destructive",
                  disabled: data.scheduledTweets.status === "completed",
                },
              ]}
            />
          </div>
        );
      },
    },
  ];

  return <DataTable ref={tableRef} columns={columns} serverAction={ScheduledTweetController.getScheduledTweets as any} queryKey="scheduledTweetsList" searchAble={true} />;
};

export default AllScheduledTweetsTable;
