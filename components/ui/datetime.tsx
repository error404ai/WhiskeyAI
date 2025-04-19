"use client";

import React from "react";
import { format, formatDistance, Locale } from "date-fns";
import { enUS } from "date-fns/locale";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type DateTimeProps = {
  /**
   * The date to format (string, Date object, or timestamp)
   */
  date: string | Date | number | null | undefined;
  
  /**
   * Format to display the date
   * @default "PPP" (e.g., "April 29, 2023")
   */
  formatStr?: string;
  
  /**
   * Whether to show relative time (e.g., "2 hours ago")
   * @default false
   */
  relative?: boolean;
  
  /**
   * Whether to show the exact time in a tooltip on hover
   * @default true
   */
  showTooltip?: boolean;
  
  /**
   * Locale for formatting
   * @default enUS
   */
  locale?: Locale;
  
  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Optional tooltip text override
   */
  tooltipText?: string;
};

export function DateTime({
  date,
  formatStr = "PPP",
  relative = false,
  showTooltip = true,
  locale = enUS,
  className,
  tooltipText,
}: DateTimeProps) {
  if (!date) return <span className={cn("text-muted-foreground", className)}>No date</span>;

  // Convert to Date object if string or number
  const dateObj = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  
  // Format the date according to the format string
  const formattedDate = relative 
    ? formatDistance(dateObj, new Date(), { addSuffix: true, locale }) 
    : format(dateObj, formatStr, { locale });
  
  // Full date-time for tooltip
  const fullDateTime = tooltipText || format(dateObj, "PPpp", { locale });

  // If tooltip is disabled, just return the formatted date
  if (!showTooltip) {
    return <span className={className}>{formattedDate}</span>;
  }

  // Return date with tooltip
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={className}>{formattedDate}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{fullDateTime}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * RelativeTime component for showing times like "2 hours ago"
 */
export function RelativeTime(props: Omit<DateTimeProps, 'relative'>) {
  return <DateTime {...props} relative={true} />;
} 