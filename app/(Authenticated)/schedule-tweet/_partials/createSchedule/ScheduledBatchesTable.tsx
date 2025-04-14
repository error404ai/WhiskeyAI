/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { DataTable, DataTableRef } from "@/components/Datatable/Datatable";
import { DataTableColumnHeader } from "@/components/Datatable/DatatableColumnHeader";
import { ActionButtons } from "@/components/ui/action-buttons";
import { DateTime } from "@/components/ui/datetime";
import * as ScheduledTweetController from "@/server/controllers/ScheduledTweetController";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, Eye, Trash } from "lucide-react";
import { useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getScheduledTweetColumns } from "./ScheduledTweetColumns";

const ScheduledBatchesTable = () => {
  const tableRef = useRef<DataTableRef>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(searchParams.get("batchId"));

  // Define columns for the batch list table
  const batchColumns: ColumnDef<{
    batchId: string;
    createdAt: Date;
  }>[] = [
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
        const data = row.original;

        return (
          <div className="flex justify-end">
            <ActionButtons
              actions={[
                {
                  label: "View",
                  onClick: () => {
                    // Update URL with batchId parameter
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("batchId", data.batchId);
                    router.push(`?${params.toString()}`);
                    // Set selected batch ID to show detail view
                    setSelectedBatchId(data.batchId);
                  },
                  icon: <Eye className="h-4 w-4" />,
                },
                {
                  label: "Cancel Batch",
                  onClick: () => {
                    // Delete action logic
                    console.log("Delete tweet", data.batchId);
                  },
                  icon: <Trash className="h-4 w-4" />,
                  variant: "destructive",
                },
              ]}
            />
          </div>
        );
      },
    },
  ];

  // Use the shared column definitions for the batch detail table
  const batchDetailColumns = getScheduledTweetColumns((id) => {
    console.log("Cancel tweet with ID:", id);
  });

  const handleBackToBatches = () => {
    // Clear the batchId from URL
    const params = new URLSearchParams(searchParams.toString());
    params.delete("batchId");
    router.push(`?${params.toString()}`);
    // Reset selected batch ID to return to batch list view
    setSelectedBatchId(null);
  };

  if (selectedBatchId) {
    return (
      <div>
        <div className="mb-4 flex items-center">
          <Button 
            variant="outline" 
            onClick={handleBackToBatches} 
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Batches
          </Button>
          <h2 className="ml-4 text-xl font-semibold">Batch ID: {selectedBatchId}</h2>
        </div>
        <DataTable 
          ref={tableRef} 
          columns={batchDetailColumns} 
          serverAction={(params) => ScheduledTweetController.getSchedulesByBatchId(params, selectedBatchId) as any} 
          queryKey={`batchDetails-${selectedBatchId}`} 
          searchAble={false} 
        />
      </div>
    );
  }

  return <DataTable ref={tableRef} columns={batchColumns} serverAction={ScheduledTweetController.getScheduledBatches as any} queryKey="scheduledTweetsList" searchAble={false} />;
};

export default ScheduledBatchesTable;
