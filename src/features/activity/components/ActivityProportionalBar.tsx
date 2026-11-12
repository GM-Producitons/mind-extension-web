"use client";

import { cn } from "cn";
import type { LucideIcon } from "lucide-react";
import {
  ACTIVITY_STATE_ICONS,
  activityStateColor,
  type ActivityBarSegment,
} from "../lib/activity-state-visual";
import { formatDuration } from "../lib/activity-time";

const DEFAULT_MIN_ICON_FRACTION = 0.1;

export function ActivityProportionalBar({
  segments,
  className,
  barClassName,
  heightClass = "h-5",
  minIconFraction = DEFAULT_MIN_ICON_FRACTION,
  showIcons = true,
}: {
  segments: ActivityBarSegment[];
  className?: string;
  barClassName?: string;
  heightClass?: string;
  minIconFraction?: number;
  showIcons?: boolean;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.ms, 0);
  if (total <= 0) {
    return (
      <div
        className={cn("w-full rounded-sm bg-muted", heightClass, barClassName)}
      />
    );
  }

  const filled = segments.filter((segment) => segment.ms > 0);

  return (
    <div className={cn("flex w-full min-w-0", className)}>
      <div
        className={cn(
          "flex min-w-0 flex-1 overflow-hidden rounded-sm",
          heightClass,
          barClassName,
        )}
      >
        {filled.map((segment) => {
          const fraction = segment.ms / total;
          const Icon = ACTIVITY_STATE_ICONS[segment.state];
          const showIcon = showIcons && fraction >= minIconFraction;
          return (
            <div
              key={segment.state}
              className="relative flex min-w-0 items-center justify-center"
              style={{
                flexGrow: segment.ms,
                flexBasis: 0,
                backgroundColor: activityStateColor(segment.state),
              }}
            >
              {showIcon ? (
                <Icon
                  className="size-3 shrink-0 text-primary-foreground opacity-95"
                  aria-hidden
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ActivityLegendRow({
  icon: RowIcon,
  segments,
  durationMs,
  barHeightClass = "h-4",
}: {
  icon: LucideIcon;
  segments: ActivityBarSegment[];
  durationMs: number;
  barHeightClass?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <RowIcon
        className="size-3.5 shrink-0 text-muted-foreground"
        aria-hidden
      />
      <ActivityProportionalBar
        segments={segments}
        heightClass={barHeightClass}
        className="min-w-0 flex-1"
      />
      <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
        {formatDuration(durationMs)}
      </span>
    </div>
  );
}
