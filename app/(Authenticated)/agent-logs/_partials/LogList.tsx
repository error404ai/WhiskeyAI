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

  const columns: ColumnDef<TriggerLog>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="ID" />;
      },
      enableSorting: false,
    },
    {
      accessorKey: "agentId",
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Agent ID" />;
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
      cell: ({ row }) => {
        const errorDetails = row.getValue("errorDetails") as string;
        return <div className="max-w-44">{errorDetails}</div>;
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
        // Format date if it exists
        return date ? formatDistanceToNow(new Date(date), { addSuffix: true }) : "N/A";
      },
      enableSorting: false,
    },
  ];

  return (
    <div>
      <DataTable ref={tableRef} columns={columns} serverAction={TriggerLogController.getUserTriggerLogs} queryKey="triggerLogsList" />
    </div>
  );
};

export default LogList;
