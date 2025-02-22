"use client";

import { format } from "date-fns";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { CardTitle } from "../ui/card";

type DatePickerProps = {
  label?: string;
  required?: boolean;
  name?: string;
};

const DatePicker: React.FC<DatePickerProps> = ({ label, name, required }) => {
  const context = useFormContext();
  const errors = context?.formState.errors ?? {};
  const error = name ? (errors?.[name as keyof typeof errors]?.message as string) : "";
  const value = context.watch(name as string);

  return (
    <label className="flex w-fit flex-col gap-2">
      {label && (
        <CardTitle className="text-black dark:text-white">
          {label} {required && <span className="text-red-600">*</span>}
        </CardTitle>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <div>
            <Button type="button" parentClass="w-fit" variant={"outline"} className={cn("w-[240px] justify-start text-left font-normal", !value && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? format(value, "PPP") : <span>Pick a date</span>}
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={value ? new Date(value) : undefined} onSelect={(date) => date && context.setValue(name as string, date.toLocaleString())} autoFocus />
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-red-500 select-none">{error}</p>}
    </label>
  );
};

export default DatePicker;
