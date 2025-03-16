"use client";

import { cn } from "@/lib/utils";
import { CheckIcon, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CopyableTextProps {
  text: string;
  displayText?: string;
  className?: string;
  label?: string;
  successMessage?: string;
}

export function CopyableText({ text, displayText, className, label, successMessage = "Copied to clipboard!" }: CopyableTextProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(successMessage);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
      toast.error("Failed to copy text");
    }
  };

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      {label && <div className="text-sm font-medium text-muted-foreground">{label}</div>}
      <div className="flex items-center gap-2">
        <div className="bg-muted overflow-hidden overflow-ellipsis whitespace-nowrap rounded-md border px-3 py-2 text-sm flex-1">
          {displayText || text}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="bg-background text-muted-foreground hover:text-foreground flex h-8 w-8 items-center justify-center rounded-md border transition-colors"
          aria-label="Copy to clipboard"
        >
          {copied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
} 