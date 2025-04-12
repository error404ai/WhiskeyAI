"use client";
import { DataTable, DataTableRef } from "@/components/Datatable/Datatable";
import { DataTableColumnHeader } from "@/components/Datatable/DatatableColumnHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import * as ScheduledTweetController from "@/server/controllers/ScheduledTweetController";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Calendar, Clock, MoreHorizontal, Trash } from "lucide-react";
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

  // Get status badge based on tweet status
  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
      case "completed":
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      case "failed":
        return <Badge className="bg-red-500 hover:bg-red-600">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Define columns for the table - ensuring all have proper cell definitions
  const columns: ColumnDef<ScheduledTweetWithAgent>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
      size: 60,
      enableSorting: false,
    },
    {
      accessorKey: "agentName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Agent" />,
      size: 150,
      enableSorting: false,
    },
    {
      accessorKey: "content",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Content" />,
      enableSorting: false,
    },
    {
      accessorKey: "scheduledAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Scheduled For" />,
      cell: ({ row }) => {
        const date = row.getValue("scheduledAt");
        if (!date) return "N/A";

        try {
          const formattedDate = format(new Date(date as Date), "MMM d, yyyy");
          const formattedTime = format(new Date(date as Date), "h:mm a");

          return (
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <Calendar className="text-muted-foreground h-3 w-3" />
                <span className="text-xs">{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="text-muted-foreground h-3 w-3" />
                <span className="text-xs">{formattedTime}</span>
              </div>
            </div>
          );
        } catch (error) {
          console.error("Error formatting date:", error);
          return "Invalid date";
        }
      },
      size: 130,
      enableSorting: false,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = row.getValue("status") as string | null;
        return getStatusBadge(status);
      },
      size: 120,
      enableSorting: false,
    },
    {
      accessorKey: "errorMessage",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Error" />,
      cell: ({ row }) => {
        const errorMessage = row.getValue("errorMessage") as string | null;
        if (!errorMessage) return null;

        return (
          <div className="max-w-[300px] truncate text-xs text-red-500" title={errorMessage}>
            {errorMessage}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const tweet = row.original;

        // Only allow deleting pending tweets
        if (tweet.status !== "pending") {
          return null;
        }

        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isDeleting}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer text-red-500" onClick={() => handleDeleteTweet(tweet.id)} disabled={isDeleting}>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      size: 50,
      enableSorting: false,
    },
  ];

  return <DataTable ref={tableRef} columns={columns} serverAction={ScheduledTweetController.getScheduledTweets} queryKey="scheduledTweetsList" searchAble={true} />;
};

export default ScheduledTweetsTable;
