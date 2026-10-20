import { describe, expect, it } from "vitest";
import {
  NUDGE_INTERVAL_MS,
  cairoDayStart,
  formatStatusLine,
  isNudgeDue,
  summarizeDay,
  type ActivitySessionSpan,
} from "./activity-time";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

function at(iso: string): Date {
  return new Date(iso);
}

function span(
  startedAt: string,
  endedAt: string | null,
  lastNudgedAt: string | null = null,
): ActivitySessionSpan {
  return {
    startedAt: at(startedAt),
    endedAt: endedAt ? at(endedAt) : null,
    lastNudgedAt: lastNudgedAt ? at(lastNudgedAt) : null,
  };
}

describe("cairoDayStart", () => {
  it("is Cairo midnight in winter (UTC+2) and summer (UTC+3)", () => {
    expect(cairoDayStart(at("2026-01-15T10:00:00.000Z")).toISOString()).toBe(
      "2026-01-14T22:00:00.000Z",
    );
    expect(cairoDayStart(at("2026-06-15T09:00:00.000Z")).toISOString()).toBe(
      "2026-06-14T21:00:00.000Z",
    );
  });
});

describe("summarizeDay", () => {
  it("treats a day with no sessions as free since Cairo midnight", () => {
    const now = at("2026-01-15T10:05:00.000Z");
    const summary = summarizeDay([], null, now);

    expect(summary).toEqual({
      state: "FREE",
      stateMs: 12 * HOUR + 5 * MINUTE,
      workMs: 0,
      freeMs: 12 * HOUR + 5 * MINUTE,
    });
    expect(formatStatusLine(summary)).toBe(
      "FREE 12h 05m · Today: work 0h 00m / free 12h 05m",
    );
  });

  it("counts an open session from its start, and clips today's work to midnight", () => {
    const now = at("2026-01-15T10:00:00.000Z");
    const summary = summarizeDay(
      [span("2026-01-14T20:00:00.000Z", null)],
      at("2026-01-14T18:00:00.000Z"),
      now,
    );

    expect(summary).toEqual({
      state: "WORKING",
      stateMs: 14 * HOUR,
      workMs: 12 * HOUR,
      freeMs: 0,
    });
    expect(formatStatusLine(summary)).toBe(
      "WORKING 14h 00m · Today: work 12h 00m / free 0h 00m",
    );
  });

  it("counts only the in-today slice of a session that crosses midnight", () => {
    const now = at("2026-01-15T10:00:00.000Z");
    const summary = summarizeDay(
      [span("2026-01-14T20:00:00.000Z", "2026-01-15T01:00:00.000Z")],
      at("2026-01-15T01:00:00.000Z"),
      now,
    );

    expect(summary).toEqual({
      state: "FREE",
      stateMs: 9 * HOUR,
      workMs: 3 * HOUR,
      freeMs: 9 * HOUR,
    });
    expect(formatStatusLine(summary)).toBe(
      "FREE 9h 00m · Today: work 3h 00m / free 9h 00m",
    );
  });

  it("sums several sessions and ignores time from before today", () => {
    const now = at("2026-01-15T12:00:00.000Z");
    const summary = summarizeDay(
      [
        span("2026-01-14T10:00:00.000Z", "2026-01-14T12:00:00.000Z"),
        span("2026-01-15T06:00:00.000Z", "2026-01-15T07:30:00.000Z"),
        span("2026-01-15T08:00:00.000Z", "2026-01-15T08:10:00.000Z"),
        span("2026-01-15T11:00:00.000Z", null),
      ],
      at("2026-01-15T08:10:00.000Z"),
      now,
    );

    expect(summary).toEqual({
      state: "WORKING",
      stateMs: HOUR,
      workMs: 2 * HOUR + 40 * MINUTE,
      freeMs: 11 * HOUR + 20 * MINUTE,
    });
    expect(formatStatusLine(summary)).toBe(
      "WORKING 1h 00m · Today: work 2h 40m / free 11h 20m",
    );
  });

  it("measures free time from the last session end, even when that was yesterday", () => {
    const now = at("2026-01-15T10:00:00.000Z");
    const summary = summarizeDay([], at("2026-01-14T20:00:00.000Z"), now);

    expect(summary.state).toBe("FREE");
    expect(summary.stateMs).toBe(14 * HOUR);
    expect(summary.workMs).toBe(0);
    expect(summary.freeMs).toBe(12 * HOUR);
  });
});

describe("isNudgeDue", () => {
  const startedAt = at("2026-01-15T08:00:00.000Z");
  const open = span("2026-01-15T08:00:00.000Z", null);

  it("is false until a full hour after the session starts", () => {
    expect(isNudgeDue(open, new Date(startedAt.getTime() + NUDGE_INTERVAL_MS - 1))).toBe(
      false,
    );
    expect(isNudgeDue(open, new Date(startedAt.getTime() + NUDGE_INTERVAL_MS))).toBe(
      true,
    );
  });

  it("waits an hour after the last nudge, then becomes due again", () => {
    const nudged = span(
      "2026-01-15T08:00:00.000Z",
      null,
      "2026-01-15T09:00:00.000Z",
    );
    const nudgedAt = at("2026-01-15T09:00:00.000Z");

    expect(isNudgeDue(nudged, new Date(nudgedAt.getTime() + 30 * MINUTE))).toBe(false);
    expect(isNudgeDue(nudged, new Date(nudgedAt.getTime() + NUDGE_INTERVAL_MS))).toBe(
      true,
    );
  });

  it("is false when there is no open session", () => {
    expect(isNudgeDue(null, startedAt)).toBe(false);
    expect(
      isNudgeDue(span("2026-01-15T08:00:00.000Z", "2026-01-15T10:00:00.000Z"), at("2026-01-15T12:00:00.000Z")),
    ).toBe(false);
  });
});
