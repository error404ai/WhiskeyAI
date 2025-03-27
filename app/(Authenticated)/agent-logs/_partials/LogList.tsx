"use client";
import { DataTable, DataTableRef } from "@/components/Datatable/Datatable";
import { DataTableColumnHeader } from "@/components/Datatable/DatatableColumnHeader";
import { Checkbox } from "@/components/ui/checkbox";
import { TriggerLog } from "@/db/schema";
import * as TriggerLogController from "@/server/controllers/triggerLogController";
import { ColumnDef } from "@tanstack/react-table";
import { useRef } from "react";

const LogList = () => {
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
      accessorKey: "user_id",
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="User ID" />;
      },
      enableSorting: true,
    },
  ];

  return (
    <div>
      <DataTable ref={tableRef} columns={columns} serverAction={TriggerLogController.getUserTriggerLogs} searchColumns={["title", "slug"]} queryKey="contentList" />
    </div>
  );
};

export default LogList;
