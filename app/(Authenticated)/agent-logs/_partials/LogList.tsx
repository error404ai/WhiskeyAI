"use client";
import { DataTable, DataTableRef } from "@/components/Datatable/Datatable";
import { DataTableColumnHeader } from "@/components/Datatable/DatatableColumnHeader";
import { Checkbox } from "@/components/ui/checkbox";
import { TriggerLog } from "@/db/schema";
import * as TriggerLogController from "@/server/controllers/triggerLogController";
import { ColumnDef } from "@tanstack/react-table";
import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const LogList = () => {
  'use no memo'
  const tableRef = useRef<DataTableRef>(null);

  const columns: ColumnDef<TriggerLog>[] = [
    {
      id: "select",
      header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />,
      cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="ID" />;
      },
      enableSorting: true,
    },
    {
      accessorKey: "agent_id",
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Agent ID" />;
      },
      enableSorting: true,
    },
    {
      accessorKey: "function_name",
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Function" />;
      },
      enableSorting: true,
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Status" />;
      },
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={status === "success" ? "success" : status === "error" ? "destructive" : "outline"}>
            {status}
          </Badge>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Date" />;
      },
      cell: ({ row }) => {
        const date = row.getValue("created_at") as string;
        // Format date if it exists
        return date ? format(new Date(date), "MMM dd, yyyy HH:mm:ss") : "N/A";
      },
      enableSorting: true,
    },
  ];

  return (
    <div>
      <DataTable 
        ref={tableRef} 
        columns={columns} 
        serverAction={TriggerLogController.getUserTriggerLogs} 
        searchColumns={["function_name", "status"]} 
        queryKey="triggerLogsList" 
      />
    </div>
  );
};

export default LogList;
