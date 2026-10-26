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
  workMs: number;
}

export interface WorkChartSeries {
  averageMs: number;
  bars: WorkBar[];
}

export interface WorkChart {
  week: WorkChartSeries;
  month: WorkChartSeries;
}

interface DayBucket {
  start: Date;
  workMs: number;
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

function workBetween(
  sessions: ActivitySessionSpan[],
  windowStart: Date,
  windowEnd: Date,
  now: Date,
): number {
  let total = 0;
  for (const session of sessions) {
    total += overlapMs(
      session.startedAt,
      session.endedAt ?? now,
      windowStart,
      windowEnd,
    );
  }
  return total;
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
      workMs: workBetween(sessions, start, end, now),
    });
  }

  return days;
}

function series(bars: WorkBar[], dayCount: number): WorkChartSeries {
  const total = bars.reduce((sum, bar) => sum + bar.workMs, 0);
  return {
    averageMs: Math.floor(total / dayCount),
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
      weekDays.map((day) => ({
        label: cairoLabel(day.start, { weekday: "short" }),
        workMs: day.workMs,
      })),
      WEEK_DAYS,
    ),
    month: series(
      [0, 1, 2, 3].map((week) => {
        const slice = days.slice(week * WEEK_DAYS, week * WEEK_DAYS + WEEK_DAYS);
        const workMs = slice.reduce((sum, day) => sum + day.workMs, 0);
        return {
          label: cairoLabel(slice[0].start, { month: "short", day: "numeric" }),
          workMs,
        };
      }),
      MONTH_DAYS,
    ),
  };
}
