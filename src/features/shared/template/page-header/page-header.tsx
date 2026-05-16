"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

/* ─────────────────────────────────────────────── */
/*  Types                                          */
/* ─────────────────────────────────────────────── */

export interface PageHeaderAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Main heading */
  title: string;
  /** Subheading / description */
  description?: string;
  /** Breadcrumb or other element rendered above the title */
  breadcrumb?: React.ReactNode;
  /** Actions rendered on the right side */
  actions?: PageHeaderAction[];
  /** Custom content on the right side (alternative to actions) */
  trailing?: React.ReactNode;
  /** Whether to show a bottom separator */
  separator?: boolean;
  /** Size preset */
  size?: "sm" | "md" | "lg";
}

/* ─────────────────────────────────────────────── */
/*  Component                                      */
/* ─────────────────────────────────────────────── */

export function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
  trailing,
  separator = false,
  size = "md",
  className,
  ...props
}: PageHeaderProps) {
  const sizeConfig = {
    sm: { title: "text-lg", desc: "text-xs", gap: "gap-0", mb: "mb-4" },
    md: { title: "text-2xl", desc: "text-sm", gap: "gap-0.5", mb: "mb-6" },
    lg: { title: "text-3xl", desc: "text-base", gap: "gap-1", mb: "mb-8" },
  }[size];

  return (
    <div className={cn(sizeConfig.mb, className)} {...props}>
      {breadcrumb && <div className="mb-3">{breadcrumb}</div>}

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className={cn("flex flex-col", sizeConfig.gap)}>
          <h1
            className={cn(
              sizeConfig.title,
              "font-bold tracking-tight text-foreground",
            )}
          >
            {title}
          </h1>
          {description && (
            <p className={cn(sizeConfig.desc, "text-muted-foreground")}>
              {description}
            </p>
          )}
        </div>

        {trailing ??
          (actions && actions.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant ?? "default"}
                  onClick={action.onClick}
                  disabled={action.disabled || action.loading}
                  className="gap-1.5"
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          ))}
      </div>

      {separator && <Separator className="mt-4" />}
    </div>
  );
}
