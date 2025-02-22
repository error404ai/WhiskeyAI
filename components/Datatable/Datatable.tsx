/* eslint-disable react-hooks/exhaustive-deps */

"use client";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, PaginationState, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { DataTablePagination } from "./DatatablePagination";
import { DataTableViewOptions } from "./DatatableViewOptions";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  searchColumns?: string[];
  serverAction: (props: PaginatedProps) => Promise<Pagination<TData[]>>;
}

export function DataTable<TData, TValue>({ columns, serverAction, searchColumns }: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: params.get("page") ? parseInt(params.get("page") as string, 10) - 1 : 0,
    pageSize: params.get("perPage") ? parseInt(params.get("perPage") as string, 10) : 10,
  });
  const [queryData, setQueryData] = useState<Pagination<TData[]>>({
    currentPage: 1,
    from: 1,
    lastPage: 1,
    perPage: 10,
    to: 10,
    total: 0,
    data: [],
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  const [status, setStatus] = useState<StatusType>("initial");

  const table = useReactTable({
    data: queryData.data || [],
    columns,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    rowCount: queryData.total,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      pagination,
      globalFilter,
    },
  });

  useEffect(() => {
    params.delete("page");
    params.delete("perPage");
    const otherParams = params.toString() ? `&${params.toString()}` : "";
    router.replace(`${pathName}?page=${pagination.pageIndex + 1}&perPage=${pagination.pageSize}${otherParams}`);
  }, [pagination, router]);

  useEffect(() => {
    (async () => {
      setStatus("loading");
      const queryData = await serverAction({
        page: pagination.pageIndex + 1,
        perPage: pagination.pageSize,
        search: globalFilter,
        searchColumns,
      });
      setStatus("success");
      setQueryData(queryData);
    })();
  }, [pagination, globalFilter]);

  

  return (
    <div>
      {
        <div className="flex items-center py-4">
          <Input placeholder="Search" value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="max-w-sm" />
          <DataTableViewOptions table={table} />
        </div>
      }

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>;
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {Boolean(table.getRowModel().rows?.length) &&
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))}
            {!table.getRowModel().rows?.length &&
              status === "loading" &&
              Array.from({ length: pagination.pageSize }).map(() => (
                <TableRow key={Math.random().toString()}>
                  {columns.map(() => (
                    <TableCell key={Math.random().toString()}>
                      <div>
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {!table.getRowModel().rows?.length && status === "success" && (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
