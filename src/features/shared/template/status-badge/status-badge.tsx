"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

/* ─────────────────────────────────────────────── */
/*  Status Badge                                   */
/* ─────────────────────────────────────────────── */

export type StatusType =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "pending";

export interface StatusBadgeProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** The status to display */
  status: StatusType;
  /** Custom label text. Defaults to the capitalised status name */
  label?: string;
  /** Whether to show the pulsing dot indicator */
  pulse?: boolean;
  /** Size preset */
  size?: "sm" | "md";
  /** Custom status map override */
  statusConfig?: Partial<
    Record<StatusType, { label: string; className: string }>
  >;
}

const defaultStatusConfig: Record<
  StatusType,
  { label: string; className: string }
> = {
  success: {
    label: "Active",
    className:
      "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400",
  },
  warning: {
    label: "Warning",
    className:
      "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400",
  },
  error: {
    label: "Error",
    className: "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400",
  },
  info: {
    label: "Info",
    className:
      "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400",
  },
  neutral: {
    label: "Inactive",
    className: "bg-muted text-muted-foreground border-muted",
  },
  pending: {
    label: "Pending",
    className:
      "bg-violet-500/10 text-violet-700 border-violet-500/20 dark:text-violet-400",
  },
};

const dotColor: Record<StatusType, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
  info: "bg-blue-500",
  neutral: "bg-muted-foreground/50",
  pending: "bg-violet-500",
};

export function StatusBadge({
  status,
  label,
  pulse = false,
  size = "md",
  statusConfig,
  className,
  ...props
}: StatusBadgeProps) {
  const mergedConfig = { ...defaultStatusConfig, ...statusConfig };
  const config = mergedConfig[status];
  const displayLabel = label ?? config.label;

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 font-medium border",
        config.className,
        size === "sm" ? "text-[10px] px-1.5 py-0" : "text-xs px-2 py-0.5",
        className,
      )}
      {...props}
    >
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
              dotColor[status],
            )}
          />
        )}
        <span
          className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            dotColor[status],
          )}
        />
      </span>
      {displayLabel}
    </Badge>
  );
}
