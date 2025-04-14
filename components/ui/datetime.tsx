"use client";

import React from "react";
import { format, formatDistanceToNow } from "date-fns";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "./tooltip";

export interface DateTimeProps {
  date: Date | string | number | null;
  format?: string;
  showRelative?: boolean;
  className?: string;
  emptyText?: string;
}

export function DateTime({
  date,
  format: formatString = "MMM dd, yyyy HH:mm",
  showRelative = true,
  className = "",
  emptyText = "Not available",
}: DateTimeProps) {
  if (!date) return <span className="text-muted-foreground text-sm">{emptyText}</span>;

  // Convert to Date object if needed
  const dateObj = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  
  // Format the date in the specified format
  const formattedDate = format(dateObj, formatString);
  
  // Get relative time (e.g., "2 hours ago", "5 days ago")
  const relativeTime = formatDistanceToNow(dateObj, { addSuffix: true });

  if (showRelative) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={`text-sm ${className}`}>{relativeTime}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{formattedDate}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return <span className={`text-sm ${className}`}>{formattedDate}</span>;
} 