import {
  emptyStateTotalsMs,
  formatCurrentStateHeading,
  STATUS_TOTAL_LABELS,
  STORED_ACTIVITY_STATES,
  type ActivityState,
  type StoredActivityState,
} from "./activity-states";

export const CAIRO_TIME_ZONE = "Africa/Cairo";

export interface ActivitySessionSpan {
  startedAt: Date;
  endedAt: Date | null;
  state: StoredActivityState;
}

export interface DaySummary {
  currentState: ActivityState;
  currentStateMs: number;
  since: Date;
  totalsMs: Record<StoredActivityState, number>;
  freeMs: number;
}

export interface ActivityStatusJson {
  state: ActivityState;
  since: string;
  currentMinutes: number;
  totals: Partial<Record<StoredActivityState, number>>;
  freeMinutes: number;
}

interface CairoParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function cairoParts(at: Date): CairoParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CAIRO_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(at);

  const value = (type: Intl.DateTimeFormatPartTypes) => {
    const part = parts.find((item) => item.type === type);
    return part ? Number(part.value) : 0;
  };

  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    hour: value("hour") % 24,
    minute: value("minute"),
    second: value("second"),
  };
}

/** Cairo wall clock minus UTC, in milliseconds, at second precision. */
function cairoOffsetMs(at: Date): number {
  const parts = cairoParts(at);
  const wallAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  return wallAsUtc - Math.floor(at.getTime() / 1000) * 1000;
}

export function cairoDayStart(now: Date): Date {
  const parts = cairoParts(now);
  const utcMidnight = Date.UTC(parts.year, parts.month - 1, parts.day);
  let startMs = utcMidnight - cairoOffsetMs(new Date(utcMidnight));
  const corrected = utcMidnight - cairoOffsetMs(new Date(startMs));
  if (corrected !== startMs) startMs = corrected;
  return new Date(startMs);
}

export function overlapMs(
  start: Date,
  end: Date,
  windowStart: Date,
  windowEnd: Date,
): number {
  const from = Math.max(start.getTime(), windowStart.getTime());
  const to = Math.min(end.getTime(), windowEnd.getTime());
  return Math.max(0, to - from);
}

export function summarizeDay(
  sessions: ActivitySessionSpan[],
  lastEndedAt: Date | null,
  now: Date,
): DaySummary {
  const dayStart = cairoDayStart(now);
  const totalsMs = emptyStateTotalsMs();
  let open: ActivitySessionSpan | null = null;

  for (const session of sessions) {
    const end = session.endedAt ?? now;
    const sliceMs = overlapMs(session.startedAt, end, dayStart, now);
    totalsMs[session.state] += sliceMs;
    if (session.endedAt === null) {
      if (!open || session.startedAt.getTime() > open.startedAt.getTime()) {
        open = session;
      }
    }
  }

  const elapsed = Math.max(0, now.getTime() - dayStart.getTime());
  const sessionMs = STORED_ACTIVITY_STATES.reduce(
    (sum, state) => sum + totalsMs[state],
    0,
  );
  const freeMs = Math.max(0, elapsed - sessionMs);

  if (open) {
    return {
      currentState: open.state,
      currentStateMs: Math.max(0, now.getTime() - open.startedAt.getTime()),
      since: open.startedAt,
      totalsMs,
      freeMs,
    };
  }

  const freeSince = lastEndedAt ?? dayStart;
  return {
    currentState: "free",
    currentStateMs: Math.max(0, now.getTime() - freeSince.getTime()),
    since: freeSince,
    totalsMs,
    freeMs,
  };
}

export function formatDuration(ms: number): string {
  const totalMinutes = Math.floor(Math.max(0, ms) / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

export function formatStatusDuration(ms: number): string {
  const totalMinutes = Math.floor(Math.max(0, ms) / 60_000);
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function formatStatusLine(summary: DaySummary): string {
  const parts: string[] = [
    `${formatCurrentStateHeading(summary.currentState)} ${formatStatusDuration(summary.currentStateMs)}`,
  ];

  for (const state of STORED_ACTIVITY_STATES) {
    const ms = summary.totalsMs[state];
    if (ms <= 0) continue;
    parts.push(`${STATUS_TOTAL_LABELS[state]} ${formatStatusDuration(ms)}`);
  }

  parts.push(`free ${formatStatusDuration(summary.freeMs)}`);
  return parts.join(" · ");
}

export function toStatusJson(summary: DaySummary): ActivityStatusJson {
  const totals: Partial<Record<StoredActivityState, number>> = {};
  for (const state of STORED_ACTIVITY_STATES) {
    const minutes = Math.floor(summary.totalsMs[state] / 60_000);
    if (minutes > 0) totals[state] = minutes;
  }

  return {
    state: summary.currentState,
    since: summary.since.toISOString(),
    currentMinutes: Math.floor(summary.currentStateMs / 60_000),
    totals,
    freeMinutes: Math.floor(summary.freeMs / 60_000),
  };
}

export function msToMinutes(ms: number): number {
  return Math.floor(Math.max(0, ms) / 60_000);
}
