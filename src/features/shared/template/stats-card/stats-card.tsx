"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { cva, type VariantProps } from "class-variance-authority";

/* ─────────────────────────────────────────────── */
/*  Types                                          */
/* ─────────────────────────────────────────────── */

const statsCardVariants = cva("relative overflow-hidden transition-colors", {
  variants: {
    variant: {
      default: "border bg-card hover:border-primary/30",
      filled: "border-0 bg-primary/5 hover:bg-primary/10",
      outline: "border-2 bg-transparent hover:border-primary/40",
      ghost: "border-0 bg-transparent hover:bg-muted/50",
    },
    size: {
      sm: "p-3",
      md: "p-4",
      lg: "p-5",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export interface StatsCardProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statsCardVariants> {
  /** Main title/label of the stat */
  label: string;
  /** The primary value to display */
  value: string | number;
  /** Optional description or subtitle below the value */
  description?: string;
  /** Icon displayed alongside the label */
  icon?: React.ReactNode;
  /** Trend indicator: positive, negative, or neutral */
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  /** Whether the card is in a loading state */
  loading?: boolean;
}

export function StatsCard({
  label,
  value,
  description,
  icon,
  trend,
  loading = false,
  variant,
  size,
  className,
  ...props
}: StatsCardProps) {
  const sizeConfig = {
    sm: { valueText: "text-xl", labelText: "text-xs", iconSize: "h-4 w-4" },
    md: { valueText: "text-2xl", labelText: "text-xs", iconSize: "h-4 w-4" },
    lg: { valueText: "text-3xl", labelText: "text-sm", iconSize: "h-5 w-5" },
  }[size ?? "md"];

  if (loading) {
    return (
      <Card
        className={cn(statsCardVariants({ variant, size }), className)}
        {...props}
      >
        <div className="animate-pulse space-y-2">
          <div className="h-3 w-20 rounded bg-muted" />
          <div className="h-7 w-16 rounded bg-muted" />
          <div className="h-3 w-24 rounded bg-muted" />
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(statsCardVariants({ variant, size }), className)}
      {...props}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          {icon && <span className={sizeConfig.iconSize}>{icon}</span>}
          <span
            className={cn(
              sizeConfig.labelText,
              "font-medium uppercase tracking-wide",
            )}
          >
            {label}
          </span>
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium rounded-full px-1.5 py-0.5",
              trend.direction === "up" && "text-emerald-600 bg-emerald-500/10",
              trend.direction === "down" && "text-red-600 bg-red-500/10",
              trend.direction === "neutral" && "text-muted-foreground bg-muted",
            )}
          >
            {trend.direction === "up" && "↑ "}
            {trend.direction === "down" && "↓ "}
            {trend.value}
          </span>
        )}
      </div>
      <p className={cn(sizeConfig.valueText, "font-bold mt-1")}>{value}</p>
      {description && (
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      )}
    </Card>
  );
}
