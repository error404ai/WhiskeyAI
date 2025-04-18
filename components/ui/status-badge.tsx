"use client";

import { Badge } from "@/components/ui/badge";
import { cva, type VariantProps } from "class-variance-authority";

const statusVariants = cva("", {
  variants: {
    status: {
      active: "bg-green-100 text-green-800 hover:bg-green-100",
      blocked: "bg-red-100 text-red-800 hover:bg-red-100",
      pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      inactive: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      success: "bg-green-100 text-green-800 hover:bg-green-100",
      error: "bg-red-100 text-red-800 hover:bg-red-100",
      warning: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    },
  },
  defaultVariants: {
    status: "inactive",
  },
});

export interface StatusBadgeProps extends VariantProps<typeof statusVariants> {
  /**
   * The label to display in the badge
   */
  label: string;
  /**
   * Override the badge variant (defaults to matching the status)
   */
  variant?: "outline" | "secondary" | "destructive" | "success";
  /**
   * Custom class names
   */
  className?: string;
}

export function StatusBadge({ 
  label, 
  status, 
  variant, 
  className = "" 
}: StatusBadgeProps) {
  // Map status to appropriate variant if not explicitly provided
  const getMappedVariant = () => {
    if (variant) return variant;
    
    switch (status) {
      case "active":
      case "success":
        return "success";
      case "blocked":
      case "error":
        return "destructive";
      case "pending":
      case "warning":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Badge 
      variant={getMappedVariant()}
      className={`${statusVariants({ status })} ${className}`}
    >
      {label}
    </Badge>
  );
}

// Common status badge presets for consistency
export function ActiveBadge() {
  return <StatusBadge status="active" label="Active" />;
}

export function BlockedBadge() {
  return <StatusBadge status="blocked" label="Blocked" />;
}

export function PendingBadge() {
  return <StatusBadge status="pending" label="Pending" />;
}

export function InactiveBadge() {
  return <StatusBadge status="inactive" label="Inactive" />;
} 