/* eslint-disable react-hooks/exhaustive-deps */

"use client";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, PaginationState, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, forwardRef, useImperativeHandle, ForwardedRef } from "react";
import Skeleton from "react-loading-skeleton";
import { DataTablePagination } from "./DatatablePagination";
import { DataTableViewOptions } from "./DatatableViewOptions";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Search } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  searchColumns?: string[];
  serverAction: (props: PaginatedProps) => Promise<Pagination<TData[]>>;
  queryKey: string;
}

export interface DataTableRef {
  refetch: () => Promise<void>;
}

// Create a more specific forwardRef implementation for DataTable
function DataTableComponent<TData, TValue>(
  props: DataTableProps<TData, TValue>, 
  ref: ForwardedRef<DataTableRef>
) {
  const { columns, serverAction, searchColumns, queryKey } = props;
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: params.get("page") ? parseInt(params.get("page") as string, 10) - 1 : 0,
    pageSize: params.get("perPage") ? parseInt(params.get("perPage") as string, 10) : 10,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Use React Query for data fetching
  const {
    data: queryData = {
      currentPage: 1,
      from: 1,
      lastPage: 1,
      perPage: 10,
      to: 10,
      total: 0,
      data: [],
    },
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [queryKey, pagination.pageIndex, pagination.pageSize, globalFilter, searchColumns],
    queryFn: async () => {
      return serverAction({
        page: pagination.pageIndex + 1,
        perPage: pagination.pageSize,
        search: globalFilter,
        searchColumns,
      });
    },
  });

  // Expose refetch method via ref
  useImperativeHandle(ref, () => ({
    refetch: async () => {
      await refetch();
    },
  }));

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

  return (
    <div className="space-y-4 animate-in fade-in-50 duration-300">
      <div className="flex items-center justify-between py-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search..." 
            value={globalFilter} 
            onChange={(e) => setGlobalFilter(e.target.value)} 
            className="pl-9 w-full bg-background border-border/60 focus-visible:ring-blue-500 rounded-md transition-all duration-200"
          />
        </div>
        <DataTableViewOptions table={table} />
      </div>

      <div className="rounded-lg border border-border/60 overflow-hidden bg-card/30 backdrop-blur-sm shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/30 hover:bg-muted/30">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-xs uppercase tracking-wider font-semibold">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {Boolean(table.getRowModel().rows?.length) &&
              table.getRowModel().rows.map((row) => (
                <TableRow 
                  key={row.id} 
                  data-state={row.getIsSelected() && "selected"}
                  className="transition-colors duration-200 hover:bg-muted/60 border-border/30"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id}
                      className="py-3"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {!table.getRowModel().rows?.length &&
              isLoading &&
              Array.from({ length: pagination.pageSize }).map((_, index) => (
                <TableRow key={`skeleton-${index}`} className="border-border/30">
                  {columns.map((_, colIndex) => (
                    <TableCell key={`skeleton-cell-${index}-${colIndex}`}>
                      <div>
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {!table.getRowModel().rows?.length && !isLoading && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No results found.
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

// Export with proper types
export const DataTable = forwardRef(DataTableComponent) as <TData, TValue>(
  props: DataTableProps<TData, TValue> & { ref?: ForwardedRef<DataTableRef> }
) => React.ReactElement;
