"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  formatCurrentStateHeading,
  STATUS_TOTAL_LABELS,
  STORED_ACTIVITY_STATES,
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

function msInRow(row: Record<string, string | number> | undefined, key: string) {
  const ms = row?.[key];
  return typeof ms === "number" ? ms : 0;
}

function ActivityTooltip({
  active,
  label,
  payload,
}: {
  active?: boolean;
  label?: string | number;
  payload?: ReadonlyArray<{ payload?: Record<string, string | number> }>;
}) {
  if (!active || !payload?.length) return null;

  const row = payload[0]?.payload;
  const lines = STORED_ACTIVITY_STATES.flatMap((state) => {
    const ms = msInRow(row, `${state}Ms`);
    if (ms <= 0) return [];
    return [{ state, ms }];
  });
  const totalMs = msInRow(row, "totalMs");

  return (
    <div className="grid min-w-40 gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
      <p className="font-medium">{label}</p>
      <div className="grid gap-1">
        {lines.map(({ state, ms }) => (
          <div key={state} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className="size-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: `var(--color-${state})` }}
              />
              {STATUS_TOTAL_LABELS[state]}
            </span>
            <span className="font-mono font-medium tabular-nums">
              {formatDuration(ms)}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between gap-4 border-t border-border pt-1">
          <span className="text-muted-foreground">total</span>
          <span className="font-mono font-medium tabular-nums">
            {formatDuration(totalMs)}
          </span>
        </div>
      </div>
    </div>
  );
}

function WorkBars({ data, view }: { data: WorkChart; view: ChartView }) {
  const series = view === "week" ? data.week : data.month;
  const chartData = series.bars.map((bar) => barRow(bar));

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-56 w-full px-2 pb-2 [-webkit-tap-highlight-color:transparent] [&_*:focus:not(:focus-visible)]:outline-none"
    >
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
          cursor={false}
          content={(props) => (
            <ActivityTooltip
              active={props.active}
              label={props.label}
              payload={props.payload}
            />
          )}
        />
        {STORED_ACTIVITY_STATES.map((state) => (
          <Bar
            key={state}
            dataKey={state}
            stackId="activity"
            fill={`var(--color-${state})`}
            radius={0}
            maxBarSize={48}
            activeBar={false}
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
