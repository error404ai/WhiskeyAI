"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format, formatDistance, Locale } from "date-fns";
import { enUS } from "date-fns/locale";

type DateTimeProps = {
  date: string | Date | number | null | undefined;
  formatStr?: string;
  relative?: boolean;
  showTooltip?: boolean;
  locale?: Locale;
  className?: string;
  tooltipText?: string;
  showTime?: boolean;
  timeFormat?: string;
};

export function DateTime({
  date,
  formatStr = "PPP",
  timeFormat = "p", // 'p' gives time with AM/PM
  relative = false,
  showTooltip = true,
  locale = enUS,
  className,
  tooltipText,
  showTime = true,
}: DateTimeProps) {
  if (!date) return <span className={cn("text-muted-foreground", className)}>No date</span>;

  const dateObj = typeof date === "string" || typeof date === "number" ? new Date(date) : date;

  const formattedDate = relative ? formatDistance(dateObj, new Date(), { addSuffix: true, locale }) : format(dateObj, formatStr, { locale });

  const formattedTime = format(dateObj, timeFormat, { locale });
  const fullDateTime = tooltipText || format(dateObj, "PPpp", { locale });

  const DateTimeDisplay = () => (
    <div className={cn("flex flex-col", className)}>
      <span className="font-medium">{formattedDate}</span>
      {showTime && !relative && <span className="text-muted-foreground text-sm">{formattedTime}</span>}
    </div>
  );

  if (!showTooltip) {
    return <DateTimeDisplay />;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            <DateTimeDisplay />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{fullDateTime}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function RelativeTime(props: Omit<DateTimeProps, "relative">) {
  return <DateTime {...props} relative={true} />;
}
