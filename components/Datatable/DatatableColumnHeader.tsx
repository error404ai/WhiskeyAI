import { Column } from "@tanstack/react-table";
import { ArrowDown01, ArrowUp10, ArrowDownUp, EyeOff, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({ column, title, className }: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn("font-medium text-xs uppercase tracking-wider", className)}>{title}</div>;
  }

  const isSorted = column.getIsSorted();

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 py-1 -ml-2 hover:bg-muted/40 data-[state=open]:bg-muted/40 transition-colors duration-200"
          >
            <span className="font-medium text-xs uppercase tracking-wider">{title}</span>
            {isSorted === "desc" ? (
              <ArrowDown01 className="ml-1.5 h-3.5 w-3.5 text-blue-500" />
            ) : isSorted === "asc" ? (
              <ArrowUp10 className="ml-1.5 h-3.5 w-3.5 text-blue-500" />
            ) : (
              <ArrowDownUp className="ml-1.5 h-3.5 w-3.5 opacity-50" />
            )}
          </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="start"
          className="border-border/60 bg-card shadow-md animate-in zoom-in-90 duration-100 w-[140px] p-1.5"
        >
          <DropdownMenuItem 
            onClick={() => column.toggleSorting(false)}
            className="flex items-center gap-2 rounded-md cursor-pointer text-sm py-1.5 px-2 hover:bg-muted/60 focus:bg-muted/60"
          >
            <ArrowUp10 className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Sort A to Z</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => column.toggleSorting(true)}
            className="flex items-center gap-2 rounded-md cursor-pointer text-sm py-1.5 px-2 hover:bg-muted/60 focus:bg-muted/60"
          >
            <ArrowDown01 className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Sort Z to A</span>
          </DropdownMenuItem>
          
          {isSorted && (
            <>
              <DropdownMenuSeparator className="my-1 bg-border/60" />
              <DropdownMenuItem 
                onClick={() => column.clearSorting()}
                className="flex items-center gap-2 rounded-md cursor-pointer text-sm py-1.5 px-2 hover:bg-muted/60 focus:bg-muted/60"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Clear sorting</span>
              </DropdownMenuItem>
            </>
          )}
          
          <DropdownMenuSeparator className="my-1 bg-border/60" />
          <DropdownMenuItem 
            onClick={() => column.toggleVisibility(false)}
            className="flex items-center gap-2 rounded-md cursor-pointer text-sm py-1.5 px-2 hover:bg-muted/60 focus:bg-muted/60"
          >
            <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Hide column</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
