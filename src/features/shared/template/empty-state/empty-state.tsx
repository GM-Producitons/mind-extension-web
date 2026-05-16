"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Icon displayed at the top. Defaults to Inbox */
  icon?: React.ReactNode;
  /** Main heading */
  title: string;
  /** Descriptive text below the heading */
  description?: string;
  /** Primary action button */
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary" | "ghost";
  };
  /** Secondary action button */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Size preset */
  size?: "sm" | "md" | "lg";
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  size = "md",
  className,
  ...props
}: EmptyStateProps) {
  const sizeConfig = {
    sm: {
      iconContainer: "h-12 w-12",
      iconSize: "h-6 w-6",
      heading: "text-sm",
      desc: "text-xs max-w-xs",
      py: "py-8",
    },
    md: {
      iconContainer: "h-16 w-16",
      iconSize: "h-8 w-8",
      heading: "text-lg",
      desc: "text-sm max-w-sm",
      py: "py-16",
    },
    lg: {
      iconContainer: "h-20 w-20",
      iconSize: "h-10 w-10",
      heading: "text-xl",
      desc: "text-base max-w-md",
      py: "py-24",
    },
  }[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        sizeConfig.py,
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          sizeConfig.iconContainer,
          "flex items-center justify-center rounded-full bg-muted mb-4",
        )}
      >
        {icon ?? (
          <Inbox className={cn(sizeConfig.iconSize, "text-muted-foreground")} />
        )}
      </div>
      <h3 className={cn(sizeConfig.heading, "font-semibold")}>{title}</h3>
      {description && (
        <p className={cn(sizeConfig.desc, "mt-1 text-muted-foreground")}>
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-2 mt-4">
          {action && (
            <Button
              variant={action.variant ?? "default"}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="ghost" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
