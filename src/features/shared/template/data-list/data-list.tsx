"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────── */
/*  Types                                          */
/* ─────────────────────────────────────────────── */

export interface DataListItem {
  /** Label displayed on the left */
  label: string;
  /** Value displayed on the right – string or custom ReactNode */
  value: React.ReactNode;
  /** Optional icon placed before the label */
  icon?: React.ReactNode;
  /** Whether this particular row is hidden */
  hidden?: boolean;
}

export interface DataListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of key-value items to render */
  items: DataListItem[];
  /** Layout direction */
  orientation?: "horizontal" | "stacked";
  /** Whether to show dividers between rows */
  dividers?: boolean;
  /** Size preset */
  size?: "sm" | "md" | "lg";
  /** Label width (only for horizontal orientation) */
  labelWidth?: string;
}

/* ─────────────────────────────────────────────── */
/*  Component                                      */
/* ─────────────────────────────────────────────── */

export function DataList({
  items,
  orientation = "horizontal",
  dividers = true,
  size = "md",
  labelWidth = "w-32",
  className,
  ...props
}: DataListProps) {
  const visibleItems = items.filter((item) => !item.hidden);

  const sizeConfig = {
    sm: { py: "py-2", label: "text-xs", value: "text-xs", icon: "h-3.5 w-3.5" },
    md: { py: "py-3", label: "text-sm", value: "text-sm", icon: "h-4 w-4" },
    lg: { py: "py-4", label: "text-sm", value: "text-base", icon: "h-4 w-4" },
  }[size];

  if (orientation === "stacked") {
    return (
      <div className={cn("space-y-3", className)} {...props}>
        {visibleItems.map((item, index) => (
          <div key={index} className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              {item.icon && (
                <span className={sizeConfig.icon}>{item.icon}</span>
              )}
              <span className={cn(sizeConfig.label, "font-medium")}>
                {item.label}
              </span>
            </div>
            <div className={cn(sizeConfig.value, "text-foreground")}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-0", className)} {...props}>
      {visibleItems.map((item, index) => {
        const isLast = index === visibleItems.length - 1;

        return (
          <div
            key={index}
            className={cn(
              "flex items-center gap-4",
              sizeConfig.py,
              dividers && !isLast && "border-b",
            )}
          >
            <div
              className={cn(
                "flex items-center gap-2 shrink-0 text-muted-foreground",
                labelWidth,
              )}
            >
              {item.icon && (
                <span className={sizeConfig.icon}>{item.icon}</span>
              )}
              <span className={cn(sizeConfig.label, "font-medium")}>
                {item.label}
              </span>
            </div>
            <div
              className={cn(sizeConfig.value, "text-foreground min-w-0 flex-1")}
            >
              {item.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
