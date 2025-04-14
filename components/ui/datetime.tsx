"use client";

import React from "react";
import { format, formatDistanceToNow } from "date-fns";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "./tooltip";
import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DateTimeProps {
  date: Date | string | number | null;
  format?: string;
  showRelative?: boolean;
  className?: string;
  emptyText?: string;
  variant?: "default" | "twoLine";
}

export function DateTime({
  date,
  format: formatString = "MMM dd, yyyy hh:mm a",
  showRelative = true,
  className = "",
  emptyText = "Not available",
  variant = "default",
}: DateTimeProps) {
  if (!date) return <span className="text-muted-foreground text-sm">{emptyText}</span>;

  // Convert to Date object if needed
  const dateObj = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  
  // Format the date in the specified format
  const formattedDate = format(dateObj, formatString);
  
  // For two-line variant, split date and time - using 12-hour format with AM/PM
  const dateOnly = format(dateObj, "MMM dd, yyyy");
  const timeOnly = format(dateObj, "hh:mm a"); // 12-hour format with AM/PM
  
  // Get relative time (e.g., "2 hours ago", "5 days ago")
  const relativeTime = formatDistanceToNow(dateObj, { addSuffix: true });

  if (variant === "twoLine") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex flex-col space-y-0.5 rounded-md py-1", className)}>
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <Calendar className="h-3.5 w-3.5 text-primary/70" />
                <span>{dateOnly}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-primary/60" />
                <span>{timeOnly}</span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="text-sm font-medium">{showRelative ? relativeTime : formattedDate}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (showRelative) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={cn("text-sm", className)}>{relativeTime}</span>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="text-sm font-medium">{formattedDate}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return <span className={cn("text-sm", className)}>{formattedDate}</span>;
} 