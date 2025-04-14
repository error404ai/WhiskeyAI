"use client";

import React from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

export interface ActionItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  disabled?: boolean;
}

export interface ActionButtonsProps {
  actions: ActionItem[];
  label?: string;
  inline?: boolean;
  buttonSize?: "default" | "sm" | "lg" | "icon";
}

export function ActionButtons({
  actions,
  label = "Actions",
  inline = false,
  buttonSize = "sm",
}: ActionButtonsProps) {
  if (inline) {
    return (
      <div className="flex items-center space-x-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            onClick={action.onClick}
            variant={action.variant || "outline"}
            size={buttonSize}
            disabled={action.disabled}
            className="flex items-center gap-1"
          >
            {action.icon && <span className="mr-1">{action.icon}</span>}
            {action.label}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
          <span className="sr-only">{label}</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {actions.map((action, index) => (
          <DropdownMenuItem
            key={index}
            onClick={action.onClick}
            disabled={action.disabled}
            className="flex items-center gap-2 cursor-pointer"
          >
            {action.icon}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 