"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { dayAlertState } from "../lib/dayplan-utils";
import type { DayPlan } from "../types/dayplan";
import { DayTimeline } from "./DayTimeline";

interface DayPlanSectionProps {
  plan: DayPlan;
  isFallback: boolean;
}

export function DayPlanSection({ plan, isFallback }: DayPlanSectionProps) {
  const alert = dayAlertState(plan);
  const budget = plan.capacity?.drain_budget ?? 0;
  const used = plan.capacity?.drain_used ?? 0;
  const drainRatio = budget > 0 ? Math.min(used / budget, 1.5) : 0;

  return (
    <section className="border-b border-border">
      <div className="space-y-2 px-3 py-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-mono text-xs text-muted-foreground">{plan.date}</p>
            <h2 className="text-sm font-semibold leading-snug">{plan.title}</h2>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  "shrink-0 rounded px-2 py-0.5 font-mono text-xs",
                  alert.level === "red" && "animate-pulse bg-destructive/20 text-destructive",
                  alert.level === "yellow" &&
                    "animate-pulse bg-primary/15 text-primary",
                  alert.level === "none" && "bg-muted text-muted-foreground",
                )}
              >
                drain {used}/{budget || "—"}
              </span>
            </TooltipTrigger>
            {alert.tooltip ? (
              <TooltipContent>{alert.tooltip}</TooltipContent>
            ) : null}
          </Tooltip>
        </div>

        {isFallback ? (
          <p className="text-xs text-muted-foreground">
            Today isn&apos;t planned yet. Showing {plan.date}.
          </p>
        ) : null}

        {budget > 0 ? (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full bg-primary transition-all",
                used > budget && "bg-destructive",
              )}
              style={{ width: `${Math.min(drainRatio * 100, 100)}%` }}
            />
          </div>
        ) : null}

        <p className="flex gap-3 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-3 bg-muted" />
            Buffer
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-3 bg-destructive/30" />
            Free
          </span>
        </p>

        {(plan.cut_first?.length ?? 0) > 0 ? (
          <div className="text-xs">
            <p className="font-medium text-muted-foreground">Cut first</p>
            <ul className="list-inside list-disc text-foreground">
              {plan.cut_first!.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <DayTimeline plan={plan} />
    </section>
  );
}
