/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { DataTable, DataTableRef } from "@/components/Datatable/Datatable";
import { DataTableColumnHeader } from "@/components/Datatable/DatatableColumnHeader";
import { ActionButtons } from "@/components/ui/action-buttons";
import { DateTime } from "@/components/ui/datetime";
import * as ScheduledTweetController from "@/server/controllers/ScheduledTweetController";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, Ban, Eye, Trash } from "lucide-react";
import { useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getScheduledTweetColumns } from "./ScheduledTweetColumns";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const ScheduledBatchesTable = () => {
  const tableRef = useRef<DataTableRef>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(searchParams.get("batchId"));
  const queryClient = useQueryClient();
  const batchesQueryKey = "scheduledBatchesList";
  const batchDetailsQueryKey = selectedBatchId ? `batchDetails-${selectedBatchId}` : "";

  const handleCancelBatch = async (batchId: string) => {
    try {
      // Show loading toast
      const loadingToast = toast.loading(`Cancelling batch ${batchId}...`);
      
      // Call the controller method to cancel the batch
      const result = await ScheduledTweetController.cancelBatchTweets(batchId);
      
      // Dismiss the loading toast
      toast.dismiss(loadingToast);
      
      if (result.success) {
        // Show success toast
        toast.success(result.message || "Batch cancelled successfully");
        
        // Invalidate queries to refresh the data
        queryClient.invalidateQueries({ queryKey: [batchesQueryKey] });
      } else {
        // Show error toast
        toast.error(result.message || "Failed to cancel batch");
      }
    } catch (error) {
      console.error("Error cancelling batch:", error);
      toast.error("An error occurred while cancelling the batch");
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    try {
      // Show loading toast
      const loadingToast = toast.loading(`Deleting batch ${batchId}...`);
      
      // Call the controller method to delete the batch
      const result = await ScheduledTweetController.deleteBatchTweets(batchId);
      
      // Dismiss the loading toast
      toast.dismiss(loadingToast);
      
      if (result.success) {
        // Show success toast
        toast.success(result.message || "Batch deleted successfully");
        
        // Invalidate queries to refresh the data
        queryClient.invalidateQueries({ queryKey: [batchesQueryKey] });
      } else {
        // Show error toast
        toast.error(result.message || "Failed to delete batch");
      }
    } catch (error) {
      console.error("Error deleting batch:", error);
      toast.error("An error occurred while deleting the batch");
    }
  };

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
                    handleCancelBatch(data.batchId);
                  },
                  icon: <Ban className="h-4 w-4" />,
                  variant: "secondary",
                },
                {
                  label: "Delete Batch",
                  onClick: () => {
                    handleDeleteBatch(data.batchId);
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
  const batchDetailColumns = getScheduledTweetColumns(
    batchDetailsQueryKey, 
    (id) => {
      console.log("Cancel tweet with ID:", id);
      // No need for extra feedback here as the ScheduledTweetColumns component already handles toasts
      // We'll just invalidate the queries to refresh
      queryClient.invalidateQueries({ queryKey: [batchDetailsQueryKey] });
    },
    (id) => {
      console.log("Delete tweet with ID:", id);
      // No need for extra feedback here as the ScheduledTweetColumns component already handles toasts
      // We'll just invalidate the queries to refresh
      queryClient.invalidateQueries({ queryKey: [batchDetailsQueryKey] });
    }
  );

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
          queryKey={batchDetailsQueryKey} 
          searchAble={false} 
        />
      </div>
    );
  }

  return <DataTable ref={tableRef} columns={batchColumns} serverAction={ScheduledTweetController.getScheduledBatches as any} queryKey={batchesQueryKey} searchAble={false} />;
};

export default ScheduledBatchesTable;
