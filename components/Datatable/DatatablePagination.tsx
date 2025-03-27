import { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  const pageCount = table.getPageCount();
  const currentPageIndex = table.getState().pagination.pageIndex;
  const maxVisiblePages = 5;
  const visiblePageIndices: number[] = [];

  const startPage = Math.max(0, Math.min(currentPageIndex - 2, pageCount - maxVisiblePages));
  const endPage = Math.min(pageCount, startPage + maxVisiblePages);

  for (let i = startPage; i < endPage; i++) {
    visiblePageIndices.push(i);
  }

  return (
    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between px-1 py-2">
      <div className="flex-1 text-sm text-muted-foreground mb-4 sm:mb-0">
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <span className="font-medium">
            {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected
          </span>
        )}
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-8">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px] border-border/60 focus:ring-blue-500">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top" className="border-border/60">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {currentPageIndex + 1} of {pageCount}
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="outline" 
            size="icon"
            className="h-8 w-8 hidden lg:flex border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-border transition-all duration-200" 
            onClick={() => table.setPageIndex(0)} 
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            className="h-8 w-8 border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-border transition-all duration-200" 
            onClick={() => table.previousPage()} 
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {visiblePageIndices.map((pageIndex) => (
            <Button 
              key={pageIndex} 
              variant={pageIndex === currentPageIndex ? "default" : "outline"} 
              size="icon"
              className={`h-8 w-8 transition-all duration-200 ${
                pageIndex === currentPageIndex 
                  ? "bg-blue-600 hover:bg-blue-700 text-white border-transparent" 
                  : "border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-border"
              }`}
              onClick={() => table.setPageIndex(pageIndex)} 
              disabled={pageIndex === currentPageIndex}
            >
              <span className="sr-only">{`Go to page ${pageIndex + 1}`}</span>
              {pageIndex + 1}
            </Button>
          ))}
          
          <Button 
            variant="outline" 
            size="icon"
            className="h-8 w-8 border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-border transition-all duration-200" 
            onClick={() => table.nextPage()} 
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            className="h-8 w-8 hidden lg:flex border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-border transition-all duration-200" 
            onClick={() => table.setPageIndex(pageCount - 1)} 
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
