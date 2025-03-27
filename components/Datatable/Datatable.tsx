/* eslint-disable react-hooks/exhaustive-deps */

"use client";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, PaginationState, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { ForwardedRef, forwardRef, useEffect, useImperativeHandle, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { DataTablePagination } from "./DatatablePagination";
import { DataTableViewOptions } from "./DatatableViewOptions";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  searchColumns?: string[];
  serverAction: (props: PaginatedProps) => Promise<Pagination<TData[]>>;
  queryKey: string;
  searchAble?: boolean;
}

export interface DataTableRef {
  refetch: () => Promise<void>;
}

// Create a more specific forwardRef implementation for DataTable
function DataTableComponent<TData, TValue>(props: DataTableProps<TData, TValue>, ref: ForwardedRef<DataTableRef>) {
  const { columns, serverAction, searchColumns, queryKey, searchAble = true } = props;
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());

  // Initialize state from URL parameters
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: params.get("page") ? parseInt(params.get("page") as string, 10) - 1 : 0,
    pageSize: params.get("perPage") ? parseInt(params.get("perPage") as string, 10) : 10,
  });
  const [globalFilter, setGlobalFilter] = useState(params.get("search") || "");
  const [sorting, setSorting] = useState<SortingState>(() => {
    const sortColumn = params.get("sortColumn");
    const sortOrder = params.get("sortOrder");

    if (sortColumn && (sortOrder === "asc" || sortOrder === "desc")) {
      return [{ id: sortColumn, desc: sortOrder === "desc" }];
    }
    return [];
  });
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Prepare sorting parameters for server request
  const getSortParams = (): { sortColumn?: string; sortOrder?: "asc" | "desc" } => {
    if (sorting.length > 0) {
      return {
        sortColumn: sorting[0].id,
        sortOrder: sorting[0].desc ? "desc" : "asc",
      };
    }
    return {};
  };

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
    queryKey: [queryKey, pagination.pageIndex, pagination.pageSize, globalFilter, searchColumns, sorting],
    queryFn: async () => {
      return serverAction({
        page: pagination.pageIndex + 1,
        perPage: pagination.pageSize,
        search: globalFilter,
        searchColumns,
        ...getSortParams(),
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

  // Update URL params when pagination, sorting, or search changes
  useEffect(() => {
    // Reset and build new query parameters
    const newParams = new URLSearchParams();

    // Add pagination params
    newParams.set("page", (pagination.pageIndex + 1).toString());
    newParams.set("perPage", pagination.pageSize.toString());

    // Add search param if exists
    if (globalFilter) {
      newParams.set("search", globalFilter);
    }

    // Add sorting params if exists
    if (sorting.length > 0) {
      newParams.set("sortColumn", sorting[0].id);
      newParams.set("sortOrder", sorting[0].desc ? "desc" : "asc");
    }

    // Keep other params that aren't related to our table
    searchParams.forEach((value, key) => {
      if (!["page", "perPage", "search", "sortColumn", "sortOrder"].includes(key)) {
        newParams.set(key, value);
      }
    });

    // Replace URL with new params
    router.replace(`${pathName}?${newParams.toString()}`);
  }, [pagination, sorting, globalFilter, router, pathName]);

  // Update globalFilter when search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalFilter(e.target.value);
  };

  return (
    <div className="animate-in fade-in-50 space-y-4 duration-300">
      <div className="flex items-center justify-between py-4">
        {searchAble ? (
          <div className="relative w-full max-w-sm">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input 
              placeholder="Search..." 
              value={globalFilter} 
              onChange={handleSearchChange} 
              className="bg-background border-border/60 w-full rounded-md pl-9 transition-all duration-200 focus-visible:ring-blue-500" 
            />
          </div>
        ) : (
          <div></div>
        )}
        <DataTableViewOptions table={table} />
      </div>

      <div className="border-border/60 bg-card/30 overflow-hidden rounded-lg border shadow-sm backdrop-blur-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/30 hover:bg-muted/30">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-xs font-semibold tracking-wider uppercase">
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
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="hover:bg-muted/60 border-border/30 transition-colors duration-200">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
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
                <TableCell colSpan={columns.length} className="text-muted-foreground h-24 text-center">
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
export const DataTable = forwardRef(DataTableComponent) as <TData, TValue>(props: DataTableProps<TData, TValue> & { ref?: ForwardedRef<DataTableRef> }) => React.ReactElement;
