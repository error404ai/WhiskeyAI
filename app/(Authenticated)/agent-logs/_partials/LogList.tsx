/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { DataTable, DataTableRef } from "@/components/Datatable/Datatable";
import { DataTableColumnHeader } from "@/components/Datatable/DatatableColumnHeader";
import { Badge } from "@/components/ui/badge";
import { TriggerLog } from "@/db/schema";
import * as TriggerLogController from "@/server/controllers/triggerLogController";
import { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { useRef } from "react";

const LogList = () => {
  const tableRef = useRef<DataTableRef>(null);

  const columns: ColumnDef<TriggerLog & { agentName: string }>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="ID" />;
      },
      enableSorting: false,
    },
    {
      accessorKey: "agentName",
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Agent Name" />;
      },
      enableSorting: false,
    },
    {
      accessorKey: "functionName",
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Function" />;
      },
      enableSorting: false,
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Status" />;
      },
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return <Badge variant={status === "success" ? "success" : status === "error" ? "destructive" : "outline"}>{status}</Badge>;
      },
      enableSorting: false,
    },
    {
      accessorKey: "errorDetails",
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Error Details" />;
      },
      enableSorting: false,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Time" />;
      },
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string;
        const dateObj = date ? new Date(date) : null;
        return dateObj ? formatDistanceToNow(dateObj, { addSuffix: true }) : "N/A";
      },
      enableSorting: false,
    },
  ];

  return (
    <div>
      <DataTable<TriggerLog & { agentName: string }, unknown> ref={tableRef} columns={columns} serverAction={TriggerLogController.getUserTriggerLogs as any} queryKey="triggerLogsList" searchAble={false} />
    </div>
  );
};

export default LogList;
