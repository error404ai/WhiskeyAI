/* eslint-disable @next/next/no-img-element */
import { DataTableColumnHeader } from "@/components/Datatable/DatatableColumnHeader";
import { ActionButtons } from "@/components/ui/action-buttons";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { DateTime } from "@/components/ui/datetime";
import * as ScheduledTweetController from "@/server/controllers/ScheduledTweetController";
import { useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, Ban, CheckCircle2, Clock, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ScheduledTweetWithAgent } from "./AllScheduledTweetsTable";
import ErrorMessage from "./ErrorMessage";

export const getScheduledTweetColumns = (queryKey: string, onCancel?: (id: number) => void, onDelete?: (id: number) => void): ColumnDef<ScheduledTweetWithAgent>[] => {
  // Create a wrapper component to provide React hooks context
  const ActionButtonsWrapper = ({ id, status, content }: { id: number; status: string; content: string }) => {
    const queryClient = useQueryClient();
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleCancel = async () => {
      try {
        // Use simple toast pattern
        toast.loading("Cancelling scheduled tweet...");

        // Call the controller method to cancel the tweet
        const result = await ScheduledTweetController.deleteScheduledTweet(id);

        // Dismiss all toasts
        toast.dismiss();

        if (result.success) {
          // Show success toast
          toast.success(result.message || "Tweet cancelled successfully");

          // Invalidate queries to refresh the data
          queryClient.invalidateQueries({ queryKey: [queryKey] });

          // Call the custom onCancel if provided
          if (onCancel) {
            onCancel(id);
          }
        } else {
          // Show error toast
          toast.error(result.message || "Failed to cancel tweet");
        }

        // Close the dialog
        setShowCancelDialog(false);
      } catch (error) {
        // Dismiss loading toast
        toast.dismiss();

        // Show error
        toast.error(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
        console.error("Error cancelling tweet:", error);
      }
    };

    const handleDelete = async () => {
      try {
        // Use simple toast pattern
        toast.loading("Deleting tweet...");

        // Call the controller method to delete the tweet
        const result = await ScheduledTweetController.permanentlyDeleteTweet(id);

        // Dismiss all toasts
        toast.dismiss();

        if (result.success) {
          // Show success toast
          toast.success(result.message || "Tweet deleted successfully");

          // Invalidate queries to refresh the data
          queryClient.invalidateQueries({ queryKey: [queryKey] });

          // Call the custom onDelete if provided
          if (onDelete) {
            onDelete(id);
          }
        } else {
          // Show error toast
          toast.error(result.message || "Failed to delete tweet");
        }

        // Close the dialog
        setShowDeleteDialog(false);
      } catch (error) {
        // Dismiss loading toast
        toast.dismiss();

        // Show error
        toast.error(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
        console.error("Error deleting tweet:", error);
      }
    };

    const isPending = status === "pending";

    const actions = [];

    // Add cancel action only for pending tweets
    if (isPending) {
      actions.push({
        label: "Cancel",
        onClick: () => setShowCancelDialog(true),
        icon: <Ban className="h-4 w-4" />,
        variant: "secondary" as const,
      });
    }

    // Add delete action for all tweets
    actions.push({
      label: "Delete",
      onClick: () => setShowDeleteDialog(true),
      icon: <Trash className="h-4 w-4" />,
      variant: "destructive" as const,
    });

    return (
      <>
        <ActionButtons actions={actions} />

        {/* Cancel Confirmation Dialog */}
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Scheduled Tweet</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this scheduled tweet?
                <span className="bg-muted mt-2 block rounded-md p-3">
                  <span className="block text-sm font-medium">{content}</span>
                </span>
                <span className="mt-2 block text-sm">This action will prevent the tweet from being posted but will not delete it from your records.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  handleCancel();
                }}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Confirm Cancel
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Tweet</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently delete this tweet?
                <span className="bg-muted mt-2 block rounded-md p-3">
                  <span className="text-sm font-medium">{content}</span>
                </span>
                <span className="text-destructive mt-2 block text-sm font-semibold">This action cannot be undone.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  handleDelete();
                }}
                className="bg-destructive hover:bg-destructive/90"
              >
                Permanently Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  };

  return [
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
      size: 300,
      enableSorting: false,
      cell: ({ row }) => {
        const content = row.original.scheduledTweets?.content;
        return <div className="max-w-md text-sm break-words">{content || "-"}</div>;
      },
    },
    {
      accessorKey: "scheduledTweets.mediaUrl",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Media" />,
      size: 100,
      enableSorting: false,
      cell: ({ row }) => {
        const mediaUrl = row.original.scheduledTweets?.mediaUrl;

        if (!mediaUrl) {
          return <div className="text-muted-foreground text-center text-xs">No media</div>;
        }

        // Determine if it's an image or video based on file extension
        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(mediaUrl);
        const isVideo = /\.(mp4|webm|mov|avi)$/i.test(mediaUrl);

        return (
          <div className="flex justify-center">
            {isImage && (
              <a href={mediaUrl} target="_blank" rel="noopener noreferrer">
                <img src={mediaUrl} alt="Media" className="h-16 w-auto cursor-pointer rounded-md object-cover transition-opacity hover:opacity-80" />
              </a>
            )}
            {isVideo && (
              <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                <div className="relative flex h-16 w-24 items-center justify-center rounded-md bg-black/10 transition-opacity hover:opacity-80">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
              </a>
            )}
            {!isImage && !isVideo && (
              <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                View File
              </a>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "scheduledTweets.scheduledAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Scheduled At" />,
      size: 80,
      enableSorting: false,
      cell: ({ row }) => <DateTime date={row.original.scheduledTweets?.scheduledAt} relative={false} />,
    },
    {
      accessorKey: "scheduledTweets.processedAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Processed At" />,
      size: 80,
      enableSorting: false,
      cell: ({ row }) => {
        const date = row.original.scheduledTweets?.processedAt;
        if (!date) return <span className="text-muted-foreground text-xs">Not processed</span>;
        return <DateTime date={date} relative={false} />;
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
          case "cancelled":
            variant = "destructive";
            icon = <Ban className="mr-1 h-3 w-3" />;
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
        const status = data?.scheduledTweets?.status || "";
        const content = data?.scheduledTweets?.content || "";

        return (
          <div className="flex justify-end">
            <ActionButtonsWrapper id={data.scheduledTweets.id} status={status} content={content} />
          </div>
        );
      },
    },
  ];
};
