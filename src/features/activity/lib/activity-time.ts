export const CAIRO_TIME_ZONE = "Africa/Cairo";
export const NUDGE_INTERVAL_MS = 60 * 60 * 1000;

export type ActivityState = "FREE" | "WORKING";

export interface ActivitySessionSpan {
  startedAt: Date;
  endedAt: Date | null;
  lastNudgedAt: Date | null;
}

export interface DaySummary {
  state: ActivityState;
  stateMs: number;
  workMs: number;
  freeMs: number;
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
  let workMs = 0;
  let open: ActivitySessionSpan | null = null;

  for (const session of sessions) {
    const end = session.endedAt ?? now;
    workMs += overlapMs(session.startedAt, end, dayStart, now);
    if (session.endedAt === null) {
      if (!open || session.startedAt.getTime() > open.startedAt.getTime()) {
        open = session;
      }
    }
  }

  const elapsed = Math.max(0, now.getTime() - dayStart.getTime());
  const freeMs = Math.max(0, elapsed - workMs);

  if (open) {
    return {
      state: "WORKING",
      stateMs: Math.max(0, now.getTime() - open.startedAt.getTime()),
      workMs,
      freeMs,
    };
  }

  const freeSince = lastEndedAt ?? dayStart;
  return {
    state: "FREE",
    stateMs: Math.max(0, now.getTime() - freeSince.getTime()),
    workMs,
    freeMs,
  };
}

export function isNudgeDue(
  session: ActivitySessionSpan | null,
  now: Date,
): boolean {
  if (!session || session.endedAt !== null) return false;
  const anchor = session.lastNudgedAt ?? session.startedAt;
  return now.getTime() - anchor.getTime() >= NUDGE_INTERVAL_MS;
}

export function formatDuration(ms: number): string {
  const totalMinutes = Math.floor(Math.max(0, ms) / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

export function formatStatusLine(summary: DaySummary): string {
  return `${summary.state} ${formatDuration(summary.stateMs)} · Today: work ${formatDuration(summary.workMs)} / free ${formatDuration(summary.freeMs)}`;
}
