"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { WorkChart } from "../lib/activity-chart";
import { formatDuration } from "../lib/activity-time";
import { useWorkChart } from "../hooks/use-work-chart";

const chartConfig = {
  hours: { label: "Work", color: "var(--chart-1)" },
} satisfies ChartConfig;

type ChartView = "week" | "month";

function workMsFromTooltip(value: unknown, payload: unknown): number {
  if (payload && typeof payload === "object" && "workMs" in payload) {
    const workMs = payload.workMs;
    if (typeof workMs === "number") return workMs;
  }
  return Number(value) * 3_600_000;
}

function WorkBars({ data, view }: { data: WorkChart; view: ChartView }) {
  const series = view === "week" ? data.week : data.month;
  const chartData = series.bars.map((bar) => ({
    label: bar.label,
    hours: bar.workMs / 3_600_000,
    workMs: bar.workMs,
  }));

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full px-2 pb-2">
      <BarChart data={chartData} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          width={32}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) => `${value}`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, _name, item) => (
                <span className="font-mono font-medium tabular-nums">
                  {formatDuration(workMsFromTooltip(value, item.payload))}
                </span>
              )}
            />
          }
        />
        <Bar dataKey="hours" fill="var(--color-hours)" radius={4} maxBarSize={48} />
      </BarChart>
    </ChartContainer>
  );
}

export function WorkChartPanel() {
  const { data, isLoading, error } = useWorkChart();
  const [view, setView] = useState<ChartView>("week");
  const averageMs =
    data == null ? 0 : view === "week" ? data.week.averageMs : data.month.averageMs;

  return (
    <section className="mt-8 border-t border-border">
      <div className="flex items-center justify-between gap-3 px-3 py-2">
        <div className="min-w-0">
          <p className="text-sm font-medium">Work</p>
          <p className="font-mono text-sm tabular-nums text-muted-foreground">
            {isLoading ? "…" : error ? error : `${formatDuration(averageMs)} / day`}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            size="xs"
            variant={view === "week" ? "default" : "outline"}
            aria-pressed={view === "week"}
            onClick={() => setView("week")}
          >
            Week
          </Button>
          <Button
            size="xs"
            variant={view === "month" ? "default" : "outline"}
            aria-pressed={view === "month"}
            onClick={() => setView("month")}
          >
            Month
          </Button>
        </div>
      </div>
      {data ? <WorkBars data={data} view={view} /> : <div className="h-56" />}
    </section>
  );
}
