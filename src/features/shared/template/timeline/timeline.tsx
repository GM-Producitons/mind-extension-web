"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Circle } from "lucide-react";

/* ─────────────────────────────────────────────── */
/*  Types                                          */
/* ─────────────────────────────────────────────── */

export interface TimelineEvent {
  /** Unique identifier */
  id: string;
  /** Main event title */
  title: string;
  /** Event description */
  description?: string;
  /** Timestamp string (displayed as-is) */
  timestamp: string;
  /** Custom icon for this event */
  icon?: React.ReactNode;
  /** Status that determines the dot color */
  status?: "default" | "success" | "warning" | "error" | "info";
  /** Additional metadata rendered below the description */
  meta?: React.ReactNode;
}

export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of events to display in chronological order */
  events: TimelineEvent[];
  /** Size preset */
  size?: "sm" | "md" | "lg";
  /** Whether to show the connecting line */
  showLine?: boolean;
  /** Whether events are reversed (newest first) */
  reverse?: boolean;
}

/* ─────────────────────────────────────────────── */
/*  Component                                      */
/* ─────────────────────────────────────────────── */

const statusDotColor: Record<string, string> = {
  default: "bg-muted-foreground/40",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
  info: "bg-blue-500",
};

const statusRingColor: Record<string, string> = {
  default: "ring-muted-foreground/20",
  success: "ring-emerald-500/20",
  warning: "ring-amber-500/20",
  error: "ring-red-500/20",
  info: "ring-blue-500/20",
};

export function Timeline({
  events,
  size = "md",
  showLine = true,
  reverse = false,
  className,
  ...props
}: TimelineProps) {
  const sortedEvents = reverse ? [...events].reverse() : events;

  const sizeConfig = {
    sm: {
      dot: "h-2 w-2",
      iconContainer: "h-6 w-6",
      iconSize: "h-3 w-3",
      title: "text-xs",
      desc: "text-[10px]",
      time: "text-[10px]",
      gap: "gap-3",
      lineOffset: "left-[3px]",
      contentPl: "pl-5",
    },
    md: {
      dot: "h-2.5 w-2.5",
      iconContainer: "h-8 w-8",
      iconSize: "h-4 w-4",
      title: "text-sm",
      desc: "text-xs",
      time: "text-xs",
      gap: "gap-4",
      lineOffset: "left-[4px]",
      contentPl: "pl-6",
    },
    lg: {
      dot: "h-3 w-3",
      iconContainer: "h-9 w-9",
      iconSize: "h-4 w-4",
      title: "text-base",
      desc: "text-sm",
      time: "text-sm",
      gap: "gap-5",
      lineOffset: "left-[5px]",
      contentPl: "pl-7",
    },
  }[size];

  return (
    <div className={cn("relative", className)} {...props}>
      {sortedEvents.map((event, index) => {
        const isLast = index === sortedEvents.length - 1;
        const status = event.status ?? "default";
        const hasIcon = !!event.icon;

        return (
          <div
            key={event.id}
            className={cn("relative flex", sizeConfig.gap, !isLast && "pb-6")}
          >
            {/* Dot / Icon */}
            <div className="relative z-10 flex shrink-0 items-start">
              {hasIcon ? (
                <div
                  className={cn(
                    sizeConfig.iconContainer,
                    "flex items-center justify-center rounded-full bg-background ring-2",
                    statusRingColor[status],
                  )}
                >
                  {event.icon}
                </div>
              ) : (
                <div
                  className={cn(
                    sizeConfig.dot,
                    "mt-1.5 rounded-full ring-4 ring-background",
                    statusDotColor[status],
                  )}
                />
              )}

              {/* Connecting line */}
              {showLine && !isLast && (
                <div
                  className={cn(
                    "absolute top-3 w-px bg-border",
                    hasIcon
                      ? cn(
                          "left-1/2 -translate-x-1/2",
                          `h-[calc(100%-${size === "sm" ? "12px" : size === "md" ? "16px" : "18px"})]`,
                        )
                      : cn(sizeConfig.lineOffset, "h-[calc(100%-4px)]"),
                  )}
                  style={
                    hasIcon
                      ? {
                          height: `calc(100% - ${size === "sm" ? "12px" : size === "md" ? "16px" : "18px"})`,
                          top:
                            size === "sm"
                              ? "24px"
                              : size === "md"
                                ? "32px"
                                : "36px",
                        }
                      : undefined
                  }
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0">
              <div className="flex items-baseline justify-between gap-2">
                <h4
                  className={cn(
                    sizeConfig.title,
                    "font-medium text-foreground",
                  )}
                >
                  {event.title}
                </h4>
                <time
                  className={cn(
                    sizeConfig.time,
                    "shrink-0 text-muted-foreground",
                  )}
                >
                  {event.timestamp}
                </time>
              </div>
              {event.description && (
                <p
                  className={cn(
                    sizeConfig.desc,
                    "mt-0.5 text-muted-foreground leading-relaxed",
                  )}
                >
                  {event.description}
                </p>
              )}
              {event.meta && <div className="mt-1.5">{event.meta}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
