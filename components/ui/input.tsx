"use client";

import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";

import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { CardTitle } from "./card";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  icon?: string;
  name?: string;
  label?: string;
  className?: string;
  required?: boolean;
  isPassword?: boolean;
  ref?: React.Ref<HTMLInputElement>;
}
const Input: React.FC<InputProps> = ({ name, label, className, required, isPassword, type = "text", ...props }) => {
  const context = useFormContext();
  const register = context?.register;
  const errors = context?.formState.errors ?? {};
  const [eyeOpen, setEyeOpen] = useState(false);
  const error = name ? (errors?.[name as keyof typeof errors]?.message as string) : "";
  return (
    <label className="flex flex-col gap-2">
      {label && (
        <CardTitle className="text-black dark:text-white">
          {label} {required && <span className="text-red-600">*</span>}
        </CardTitle>
      )}
      <div className="relative">
        <input
          {...(name && register ? register(name) : {})}
          className={cn(
            "peer border-input bg-muted file:text-foreground placeholder:text-muted-foreground focus:text-primary flex h-9 w-full rounded-md border px-3 py-1 text-base shadow-xs transition-colors select-none file:border-0 file:bg-transparent file:text-sm file:font-medium focus:border-[1px] focus:border-slate-700 focus:bg-gray-900 focus-visible:ring-0 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            {
              "border-[1px] border-red-600": error,
            },
            className,
          )}
          {...props}
          {...(isPassword ? { type: eyeOpen ? "text" : "password" } : { type: type })}
        />
        {eyeOpen && isPassword && (
          <Eye
            className="peer-focus:text-secondary absolute top-1/2 right-2 size-5 -translate-y-1/2 cursor-pointer"
            onClick={(e) => {
              setEyeOpen(false);
              e.preventDefault();
            }}
          />
        )}
        {!eyeOpen && isPassword && (
          <EyeOff
            className="peer-focus:text-secondary absolute top-1/2 right-2 size-5 -translate-y-1/2 cursor-pointer"
            onClick={(e) => {
              setEyeOpen(true);
              e.preventDefault();
            }}
          />
        )}
      </div>
      {error && <p className="text-xs text-red-500 select-none">{error}</p>}
    </label>
  );
};
Input.displayName = "Input";

export { Input };
