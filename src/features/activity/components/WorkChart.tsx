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
import {
  formatCurrentStateHeading,
  STATUS_TOTAL_LABELS,
  STORED_ACTIVITY_STATES,
  type StoredActivityState,
} from "../lib/activity-states";
import type { WorkBar, WorkChart } from "../lib/activity-chart";
import { formatDuration, formatStatusDuration } from "../lib/activity-time";
import { useWorkChart } from "../hooks/use-work-chart";

const GREY_OPACITIES = [0.28, 0.34, 0.4, 0.46, 0.52, 0.58, 0.64, 0.7] as const;

const chartConfig = STORED_ACTIVITY_STATES.reduce((config, state, index) => {
  config[state] = {
    label: STATUS_TOTAL_LABELS[state],
    color: `color-mix(in oklch, var(--muted-foreground) ${Math.round(GREY_OPACITIES[index] * 100)}%, transparent)`,
  };
  return config;
}, {} as ChartConfig);

type ChartView = "week" | "month";

function barRow(bar: WorkBar) {
  const row: Record<string, string | number> = {
    label: bar.label,
    totalMs: bar.totalMs,
  };
  for (const state of STORED_ACTIVITY_STATES) {
    row[state] = bar.byStateMs[state] / 3_600_000;
    row[`${state}Ms`] = bar.byStateMs[state];
  }
  return row;
}

function WorkBars({ data, view }: { data: WorkChart; view: ChartView }) {
  const series = view === "week" ? data.week : data.month;
  const chartData = series.bars.map((bar) => barRow(bar));

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
              formatter={(value, name, item) => {
                const state = String(name) as StoredActivityState;
                const msKey = `${state}Ms`;
                const payload = item.payload as Record<string, number>;
                const ms =
                  typeof payload[msKey] === "number"
                    ? payload[msKey]
                    : Number(value) * 3_600_000;
                if (ms <= 0) return null;
                return (
                  <span className="font-mono font-medium tabular-nums">
                    {formatDuration(ms)}
                  </span>
                );
              }}
              labelFormatter={(_label, payload) => {
                const row = payload?.[0]?.payload as Record<string, number> | undefined;
                const totalMs = row?.totalMs ?? 0;
                return totalMs > 0 ? formatDuration(totalMs) : "";
              }}
            />
          }
        />
        {STORED_ACTIVITY_STATES.map((state) => (
          <Bar
            key={state}
            dataKey={state}
            stackId="activity"
            fill={`var(--color-${state})`}
            radius={0}
            maxBarSize={48}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}

export function WorkChartPanel() {
  const { data, status, isLoading, error } = useWorkChart();
  const [view, setView] = useState<ChartView>("week");
  const averageMs =
    data == null ? 0 : view === "week" ? data.week.averageMs : data.month.averageMs;

  const currentLine =
    status == null
      ? "…"
      : `${formatCurrentStateHeading(status.state)} ${formatStatusDuration(status.currentMinutes * 60_000)}`;

  return (
    <section className="mt-8 border-t border-border">
      <div className="flex items-center justify-between gap-3 px-3 py-2">
        <div className="min-w-0">
          <p className="text-sm font-medium">Activity</p>
          <p className="font-mono text-sm tabular-nums text-muted-foreground">
            {isLoading ? "…" : error ? error : currentLine}
          </p>
          {!isLoading && !error ? (
            <p className="font-mono text-xs tabular-nums text-muted-foreground">
              {formatDuration(averageMs)} / day
            </p>
          ) : null}
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
