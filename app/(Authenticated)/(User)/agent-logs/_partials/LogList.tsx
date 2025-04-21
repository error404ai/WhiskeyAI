/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { DataTable, DataTableRef } from "@/components/Datatable/Datatable";
import { DataTableColumnHeader } from "@/components/Datatable/DatatableColumnHeader";
import { Badge } from "@/components/ui/badge";
import * as TriggerLogController from "@/server/controllers/triggerLogController";
import { Agent, TriggerLog } from "@/server/db/schema";
import { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { useRef } from "react";

const LogList = () => {
  const tableRef = useRef<DataTableRef>(null);

  const columns: ColumnDef<{
    triggerLogs: TriggerLog;
    agents: Agent;
  }>[] = [
    {
      accessorKey: "triggerLogs.id",
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="ID" />;
      },
      enableSorting: false,
    },
    {
      accessorKey: "agents.name",
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Agent Name" />;
      },
      enableSorting: false,
    },
    {
      accessorKey: "triggerLogs.functionName",
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Function" />;
      },
      enableSorting: false,
    },
    {
      accessorKey: "triggerLogs.status",
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Status" />;
      },
      cell: ({ row }) => {
        const status = row.original.triggerLogs.status as string;
        return <Badge variant={status === "success" ? "success" : status === "error" ? "destructive" : "outline"}>{status}</Badge>;
      },
      enableSorting: false,
    },
    {
      accessorKey: "triggerLogs.errorDetails",
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Error Details" />;
      },
      enableSorting: false,
    },
    {
      accessorKey: "triggerLogs.createdAt",
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Time" />;
      },
      cell: ({ row }) => {
        const date = row.original.triggerLogs?.createdAt;
        const dateObj = date ? new Date(date) : null;
        return dateObj ? formatDistanceToNow(dateObj, { addSuffix: true }) : "N/A";
      },
      enableSorting: false,
    },
  ];

  return (
    <div>
      <DataTable<TriggerLog & { agentName: string }, unknown> ref={tableRef} columns={columns as any} serverAction={TriggerLogController.getUserTriggerLogs as any} queryKey="triggerLogsList" searchAble={false} />
    </div>
  );
};

export default LogList;
