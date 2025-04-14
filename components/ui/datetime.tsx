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
  format: formatString = "MMM dd, yyyy HH:mm",
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
  
  // For two-line variant, split date and time
  const dateOnly = format(dateObj, "MMM dd, yyyy");
  const timeOnly = format(dateObj, "HH:mm");
  
  // Get relative time (e.g., "2 hours ago", "5 days ago")
  const relativeTime = formatDistanceToNow(dateObj, { addSuffix: true });

  if (variant === "twoLine") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex flex-col ${className}`}>
              <div className="flex items-center gap-1 text-sm">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{dateOnly}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{timeOnly}</span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{showRelative ? relativeTime : formattedDate}</p>
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