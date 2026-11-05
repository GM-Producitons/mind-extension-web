import {
  emptyStateTotalsMs,
  rollupTotals,
  STORED_ACTIVITY_STATES,
  type ActivityRollupTotals,
  type StoredActivityState,
} from "./activity-states";
import {
  cairoDayStart,
  overlapMs,
  type ActivitySessionSpan,
} from "./activity-time";

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTH_DAYS = 28;
const WEEK_DAYS = 7;

export interface WorkBar {
  label: string;
  byStateMs: Record<StoredActivityState, number>;
  totals: ActivityRollupTotals;
}

export interface WorkChartSeries {
  averages: ActivityRollupTotals;
  bars: WorkBar[];
}

export interface WorkChart {
  week: WorkChartSeries;
  month: WorkChartSeries;
}

interface DayBucket {
  start: Date;
  byStateMs: Record<StoredActivityState, number>;
}

export function addCairoDays(dayStart: Date, days: number): Date {
  const probe = new Date(dayStart.getTime() + days * DAY_MS + 12 * 60 * 60 * 1000);
  return cairoDayStart(probe);
}

function cairoLabel(dayStart: Date, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Cairo",
    ...options,
  }).format(dayStart);
}

function trackedBetween(
  sessions: ActivitySessionSpan[],
  windowStart: Date,
  windowEnd: Date,
  now: Date,
): Record<StoredActivityState, number> {
  const byStateMs = emptyStateTotalsMs();
  for (const session of sessions) {
    byStateMs[session.state] += overlapMs(
      session.startedAt,
      session.endedAt ?? now,
      windowStart,
      windowEnd,
    );
  }
  return byStateMs;
}

function dayBuckets(
  sessions: ActivitySessionSpan[],
  now: Date,
  dayCount: number,
): DayBucket[] {
  const todayStart = cairoDayStart(now);
  const first = addCairoDays(todayStart, -(dayCount - 1));
  const days: DayBucket[] = [];

  for (let index = 0; index < dayCount; index += 1) {
    const start = addCairoDays(first, index);
    const end = index === dayCount - 1 ? now : addCairoDays(first, index + 1);
    days.push({
      start,
      byStateMs: trackedBetween(sessions, start, end, now),
    });
  }

  return days;
}

function toBar(day: DayBucket, label: string): WorkBar {
  return {
    label,
    byStateMs: day.byStateMs,
    totals: rollupTotals(day.byStateMs),
  };
}

function averageRollups(bars: WorkBar[], dayCount: number): ActivityRollupTotals {
  const sum = bars.reduce(
    (acc, bar) => ({
      focusMs: acc.focusMs + bar.totals.focusMs,
      trainingMs: acc.trainingMs + bar.totals.trainingMs,
      trackedMs: acc.trackedMs + bar.totals.trackedMs,
      sleepMs: acc.sleepMs + bar.totals.sleepMs,
    }),
    { focusMs: 0, trainingMs: 0, trackedMs: 0, sleepMs: 0 },
  );
  return {
    focusMs: Math.floor(sum.focusMs / dayCount),
    trainingMs: Math.floor(sum.trainingMs / dayCount),
    trackedMs: Math.floor(sum.trackedMs / dayCount),
    sleepMs: Math.floor(sum.sleepMs / dayCount),
  };
}

function series(bars: WorkBar[], dayCount: number): WorkChartSeries {
  return {
    averages: averageRollups(bars, dayCount),
    bars,
  };
}

export function buildWorkChart(
  sessions: ActivitySessionSpan[],
  now: Date,
): WorkChart {
  const days = dayBuckets(sessions, now, MONTH_DAYS);
  const weekDays = days.slice(-WEEK_DAYS);

  return {
    week: series(
      weekDays.map((day) =>
        toBar(day, cairoLabel(day.start, { weekday: "short" })),
      ),
      WEEK_DAYS,
    ),
    month: series(
      [0, 1, 2, 3].map((week) => {
        const slice = days.slice(week * WEEK_DAYS, week * WEEK_DAYS + WEEK_DAYS);
        const byStateMs = emptyStateTotalsMs();
        for (const day of slice) {
          for (const state of STORED_ACTIVITY_STATES) {
            byStateMs[state] += day.byStateMs[state];
          }
        }
        return toBar(
          { start: slice[0].start, byStateMs },
          cairoLabel(slice[0].start, { month: "short", day: "numeric" }),
        );
      }),
      MONTH_DAYS,
    ),
  };
}
