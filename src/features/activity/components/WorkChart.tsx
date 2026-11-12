"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { RectangleProps } from "recharts";
import { Brain, Clock3, Dumbbell, Moon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  ActivityLegendRow,
  ActivityProportionalBar,
} from "./ActivityProportionalBar";
import {
  ACTIVITY_STATE_ICONS,
  activityStateColor,
  segmentsFromStates,
} from "../lib/activity-state-visual";
import {
  CHART_BAR_STATES,
  FOCUS_ACTIVITY_STATES,
  emptyStateTotalsMs,
  focusTotalMs,
  formatCurrentStateHeading,
  STORED_ACTIVITY_STATES,
  TRACKED_ACTIVITY_STATES,
  trackedTotalMs,
  trainingTotalMs,
  type StoredActivityState,
} from "../lib/activity-states";
import {
  averageByStateMs,
  type WorkBar,
  type WorkChart,
} from "../lib/activity-chart";
import { formatDuration, formatStatusDuration } from "../lib/activity-time";
import { useWorkChart } from "../hooks/use-work-chart";

const VIEW_DAY_COUNT = { week: 7, month: 28 } as const;

const chartConfig = STORED_ACTIVITY_STATES.reduce((config, state) => {
  config[state] = {
    label: state,
    color: activityStateColor(state),
  };
  return config;
}, {} as ChartConfig);

type ChartView = "week" | "month";

const AVERAGE_ROWS: {
  icon: LucideIcon;
  states: readonly StoredActivityState[];
  duration: (avgByState: Record<StoredActivityState, number>) => number;
}[] = [
  {
    icon: Brain,
    states: FOCUS_ACTIVITY_STATES,
    duration: (avg) => focusTotalMs(avg),
  },
  {
    icon: Dumbbell,
    states: ["training"],
    duration: (avg) => trainingTotalMs(avg),
  },
  {
    icon: Clock3,
    states: TRACKED_ACTIVITY_STATES,
    duration: (avg) => trackedTotalMs(avg),
  },
  {
    icon: Moon,
    states: ["sleep"],
    duration: (avg) => avg.sleep,
  },
];

function makeActivityStackShape(state: StoredActivityState) {
  const Icon = ACTIVITY_STATE_ICONS[state];
  return function ActivityStackShape(props: RectangleProps) {
    const { x = 0, y = 0, width = 0, height = 0, fill } = props;
    const showIcon = height >= 20 && width >= 12;
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} fill={fill} />
        {showIcon ? (
          <foreignObject
            x={x}
            y={y}
            width={width}
            height={height}
            className="pointer-events-none"
          >
            <div className="flex h-full w-full items-center justify-center">
              <Icon
                className="size-3 text-primary-foreground opacity-95"
                aria-hidden
              />
            </div>
          </foreignObject>
        ) : null}
      </g>
    );
  };
}

const stackShapes = CHART_BAR_STATES.reduce(
  (shapes, state) => {
    shapes[state] = makeActivityStackShape(state);
    return shapes;
  },
  {} as Record<StoredActivityState, (props: RectangleProps) => React.JSX.Element>,
);

function barRow(bar: WorkBar) {
  const row: Record<string, string | number> = { label: bar.label };
  for (const state of STORED_ACTIVITY_STATES) {
    row[`${state}Ms`] = bar.byStateMs[state];
  }
  for (const state of CHART_BAR_STATES) {
    row[state] = bar.byStateMs[state] / 3_600_000;
  }
  return row;
}

function byStateMsFromRow(
  row: Record<string, string | number> | undefined,
): Record<StoredActivityState, number> {
  const totals = emptyStateTotalsMs();
  if (!row) return totals;
  for (const state of STORED_ACTIVITY_STATES) {
    const ms = row[`${state}Ms`];
    totals[state] = typeof ms === "number" ? ms : 0;
  }
  return totals;
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
  const byStateMs = byStateMsFromRow(row);
  const dayMs = STORED_ACTIVITY_STATES.reduce(
    (sum, state) => sum + byStateMs[state],
    0,
  );

  return (
    <div className="grid w-52 gap-2 rounded-lg border border-border/50 bg-background px-2.5 py-2 text-xs shadow-xl">
      <p className="font-medium">{label}</p>
      <ActivityProportionalBar
        segments={segmentsFromStates(byStateMs, STORED_ACTIVITY_STATES)}
        heightClass="h-5"
      />
      <p className="text-right font-mono text-[10px] tabular-nums text-muted-foreground">
        {formatDuration(dayMs)}
      </p>
      <div className="grid gap-1 border-t border-border pt-1.5">
        {AVERAGE_ROWS.map(({ icon, states, duration }) => (
          <ActivityLegendRow
            key={states.join("-")}
            icon={icon}
            segments={segmentsFromStates(byStateMs, states)}
            durationMs={duration(byStateMs)}
            barHeightClass="h-3"
          />
        ))}
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
        {CHART_BAR_STATES.map((state) => (
          <Bar
            key={state}
            dataKey={state}
            stackId="activity"
            fill={`var(--color-${state})`}
            shape={stackShapes[state]}
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

  const series = data == null ? null : view === "week" ? data.week : data.month;
  const avgByState = useMemo(() => {
    if (!series) return null;
    return averageByStateMs(series.bars, VIEW_DAY_COUNT[view]);
  }, [series, view]);

  const currentLine =
    status == null
      ? "…"
      : `${formatCurrentStateHeading(status.state)} ${formatStatusDuration(status.currentMinutes * 60_000)}`;

  return (
    <section className="mt-8 border-t border-border">
      <div className="flex items-center justify-between gap-3 px-3 py-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Activity</p>
          <p className="font-mono text-sm tabular-nums text-muted-foreground">
            {isLoading ? "…" : error ? error : currentLine}
          </p>
          {!isLoading && !error && avgByState ? (
            <div className="mt-1.5 grid gap-1">
              {AVERAGE_ROWS.map(({ icon, states, duration }) => (
                <ActivityLegendRow
                  key={states.join("-")}
                  icon={icon}
                  segments={segmentsFromStates(avgByState, states)}
                  durationMs={duration(avgByState)}
                />
              ))}
            </div>
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
