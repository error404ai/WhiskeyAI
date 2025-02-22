import * as React from "react";

import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";
import { CardTitle } from "./card";

interface Props extends React.InputHTMLAttributes<HTMLTextAreaElement> {
  placeholder?: string;
  icon?: string;
  name?: string;
  label?: string;
  className?: string;
  required?: boolean;
  isPassword?: boolean;
  ref?: React.Ref<HTMLTextAreaElement>;
}

const Textarea: React.FC<Props> = ({ className, label, name, required, ...props }) => {
  const context = useFormContext();
  const errors = context?.formState.errors;
  const register = context?.register;

  const error = name ? (errors?.[name]?.message as string) : "";
  return (
    <label className="flex w-full flex-col gap-2">
      {label && (
        <CardTitle className="text-black dark:text-white">
          {label} {required && <span className="text-red-600">*</span>}
        </CardTitle>
      )}
      <textarea
        {...(name && register ? register(name) : {})}
        className={cn("border-input bg-muted file:text-foreground placeholder:text-muted-foreground focus:text-primary flex h-9 w-full rounded-md border px-3 py-1 text-base shadow-xs transition-colors select-none file:border-0 file:bg-transparent file:text-sm file:font-medium focus:border-[1px] focus:border-slate-700 focus:bg-gray-950 focus-visible:ring-0 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className)}
        {...props}
      />
      {error && <p className="text-xs text-red-500 select-none">{error}</p>}
    </label>
  );
};

Textarea.displayName = "Textarea";

export { Textarea };
