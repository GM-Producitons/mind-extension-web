import { PositionedSprint, TimelineSprint } from "../models/sprint";

export const DAY_WIDTH_PX = 32;
const DAY_MS = 24 * 60 * 60 * 1000;

function normalizeDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  const normalized = normalizeDate(date);
  return new Date(normalized.getTime() + days * DAY_MS);
}

export function diffDays(start: Date, end: Date): number {
  const startTime = normalizeDate(start).getTime();
  const endTime = normalizeDate(end).getTime();
  return Math.round((endTime - startTime) / DAY_MS);
}

export function getTimelineBounds(events: TimelineSprint[]): {
  rangeStart: Date;
  rangeEndExclusive: Date;
} {
  if (events.length === 0) {
    const today = normalizeDate(new Date());
    return {
      rangeStart: today,
      rangeEndExclusive: addDays(today, 1),
    };
  }

  let rangeStart = normalizeDate(events[0].start);
  let rangeEndExclusive = addDays(events[0].start, Math.max(events[0].days, 1));

  for (const event of events) {
    const start = normalizeDate(event.start);
    const endExclusive = addDays(start, Math.max(event.days, 1));

    if (start.getTime() < rangeStart.getTime()) {
      rangeStart = start;
    }

    if (endExclusive.getTime() > rangeEndExclusive.getTime()) {
      rangeEndExclusive = endExclusive;
    }
  }

  return { rangeStart, rangeEndExclusive };
}

export function buildDayTicks(
  rangeStart: Date,
  rangeEndExclusive: Date,
): Date[] {
  const dayCount = Math.max(diffDays(rangeStart, rangeEndExclusive), 1);
  return Array.from({ length: dayCount }, (_, index) =>
    addDays(rangeStart, index),
  );
}

export function buildPositionedSprints(
  events: TimelineSprint[],
  rangeStart: Date,
): { positioned: PositionedSprint[]; laneCount: number } {
  const laneEndByIndex: number[] = [];

  const ordered = [...events].sort((a, b) => {
    const byStart =
      normalizeDate(a.start).getTime() - normalizeDate(b.start).getTime();
    if (byStart !== 0) {
      return byStart;
    }

    return b.days - a.days;
  });

  const positioned: PositionedSprint[] = ordered.map((event) => {
    const startDayIndex = Math.max(diffDays(rangeStart, event.start), 0);
    const durationDays = Math.max(event.days, 1);
    const endDayIndexExclusive = startDayIndex + durationDays;

    let lane = laneEndByIndex.findIndex((laneEnd) => startDayIndex >= laneEnd);
    if (lane === -1) {
      lane = laneEndByIndex.length;
      laneEndByIndex.push(endDayIndexExclusive);
    } else {
      laneEndByIndex[lane] = endDayIndexExclusive;
    }

    return {
      ...event,
      lane,
      startDayIndex,
      endDayIndexExclusive,
    };
  });

  return { positioned, laneCount: Math.max(laneEndByIndex.length, 1) };
}

export function formatDayLabel(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
