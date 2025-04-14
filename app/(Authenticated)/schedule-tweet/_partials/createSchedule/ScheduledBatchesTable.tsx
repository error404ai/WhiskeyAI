"use client";
import { DataTable, DataTableRef } from "@/components/Datatable/Datatable";
import { DataTableColumnHeader } from "@/components/Datatable/DatatableColumnHeader";
import { ActionButtons } from "@/components/ui/action-buttons";
import { DateTime } from "@/components/ui/datetime";
import * as ScheduledTweetController from "@/server/controllers/ScheduledTweetController";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Eye, Trash } from "lucide-react";
import { useRef } from "react";
import { ScheduledTweetWithAgent } from "./_partials/types";

const ScheduledBatchesTable = () => {
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
      cell: ({ row }) => <DateTime date={row.original.createdAt} />,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const tweet = row.original;

        return (
          <div className="flex justify-end">
            <ActionButtons
              actions={[
                {
                  label: "View",
                  onClick: () => {
                    // View action logic
                    console.log("View tweet", tweet.id);
                  },
                  icon: <Eye className="h-4 w-4" />,
                },
                {
                  label: "Edit",
                  onClick: () => {
                    // Edit action logic
                    console.log("Edit tweet", tweet.id);
                  },
                  icon: <Edit className="h-4 w-4" />,
                  disabled: tweet.status === "completed",
                },
                {
                  label: "Delete",
                  onClick: () => {
                    // Delete action logic
                    console.log("Delete tweet", tweet.id);
                  },
                  icon: <Trash className="h-4 w-4" />,
                  variant: "destructive",
                  disabled: tweet.status === "completed",
                },
              ]}
            />
          </div>
        );
      },
    },
  ];

  return <DataTable ref={tableRef} columns={columns} serverAction={ScheduledTweetController.getScheduledBatches} queryKey="scheduledTweetsList" searchAble={true} />;
};

export default ScheduledBatchesTable;
