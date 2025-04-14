"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  message: string | null;
  maxLength?: number;
}

const ErrorMessage = ({ message, maxLength = 30 }: ErrorMessageProps) => {
  if (!message) return null;

  // Truncate message for display in the table
  const shortMessage = message.length > maxLength 
    ? `${message.substring(0, maxLength)}...` 
    : message;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center text-destructive cursor-help">
            <AlertCircle className="mr-1 h-3.5 w-3.5" />
            <span className="text-xs">{shortMessage}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="w-80 p-0">
          <Alert variant="destructive" className="border-0 rounded-none">
            <AlertDescription className="whitespace-pre-wrap break-words text-xs">
              {message}
            </AlertDescription>
          </Alert>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ErrorMessage; 