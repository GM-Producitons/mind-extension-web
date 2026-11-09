import type { ExpectedRule, PaceKind, PaceStatus } from "../types";

const DAY_MS = 86_400_000;

/** First period is owed on the start date, then again each full period after that. */
export function scheduleExpected(
  rule: ExpectedRule,
  startDate: string,
  today: string,
): number {
  if (rule.type === "events") return 0;
  if (!rule.period || rule.amount == null || rule.amount < 1) return 0;
  return periodCount(rule.period, startDate, today) * rule.amount;
}

export function periodCount(
  period: "day" | "week" | "month",
  start: string,
  today: string,
): number {
  if (today < start) return 0;
  if (period === "day") return daysBetween(start, today) + 1;
  if (period === "week") return Math.floor(daysBetween(start, today) / 7) + 1;
  return monthPeriods(start, today);
}

export function daysBetween(start: string, today: string): number {
  return dayNumber(today) - dayNumber(start);
}

export function addMonthsClamped(start: string, months: number): string {
  const [year, month, day] = start.split("-").map(Number);
  const monthIndex = month - 1 + months;
  const nextYear = year + Math.floor(monthIndex / 12);
  const nextMonth = monthIndex % 12;
  const lastDay = new Date(Date.UTC(nextYear, nextMonth + 1, 0)).getUTCDate();
  const nextDay = Math.min(day, lastDay);
  return `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(nextDay).padStart(2, "0")}`;
}

export function paceStatus(done: number, expected: number): PaceStatus {
  if (done === 0 && expected === 0) return "new";
  const owed = expected - done;
  if (owed > 0) return "behind";
  if (owed < 0) return "ahead";
  return "on_pace";
}

export interface FoldSource {
  id: string;
  barId: string;
  kind: PaceKind;
  amount: number;
  note: string;
  source: "grok" | "ui";
  createdAt: number;
}

export interface FoldResult {
  done: number;
  expectedEntries: number;
  recentDone: number;
  recentExpected: number;
  undo: { id: string; kind: PaceKind; amount: number; note: string } | null;
}

interface FoldBucket extends FoldResult {
  undoAt: number;
}

/** Non-voided entries only. Expected entries never reduce done. */
export function foldEntries(
  entries: FoldSource[],
  nowMs: number,
): Map<string, FoldResult> {
  const since = nowMs - DAY_MS;
  const map = new Map<string, FoldBucket>();
  for (const entry of entries) {
    const fold = map.get(entry.barId) ?? {
      done: 0,
      expectedEntries: 0,
      recentDone: 0,
      recentExpected: 0,
      undo: null,
      undoAt: -1,
    };
    const recent = entry.createdAt >= since;
    if (entry.kind === "done") {
      fold.done += entry.amount;
      if (recent) fold.recentDone += entry.amount;
    } else {
      fold.expectedEntries += entry.amount;
      if (recent) fold.recentExpected += entry.amount;
    }
    if (entry.source === "ui" && entry.createdAt >= fold.undoAt) {
      fold.undo = {
        id: entry.id,
        kind: entry.kind,
        amount: entry.amount,
        note: entry.note,
      };
      fold.undoAt = entry.createdAt;
    }
    map.set(entry.barId, fold);
  }
  return map;
}

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function cairoToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function formatStartDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatPaceStamp(at: Date): string {
  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Cairo",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(at);
  return formatted.replace(" AM", " am").replace(" PM", " pm");
}

export function ruleLabel(rule: ExpectedRule): string {
  if (rule.type === "events") return "On events";
  const schedule = `+${rule.amount} / ${rule.period}`;
  if (rule.type === "schedule") return schedule;
  return `${schedule}, plus events`;
}

function dayNumber(iso: string): number {
  const [year, month, day] = iso.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / DAY_MS);
}

function monthPeriods(start: string, today: string): number {
  let count = 0;
  while (count < 2400) {
    if (addMonthsClamped(start, count) > today) break;
    count += 1;
  }
  return count;
}
