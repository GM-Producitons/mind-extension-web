import { describe, expect, it } from "vitest";
import {
  cairoDayStart,
  formatStatusLine,
  summarizeDay,
  toStatusJson,
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
  state: ActivitySessionSpan["state"] = "work",
): ActivitySessionSpan {
  return {
    startedAt: at(startedAt),
    endedAt: endedAt ? at(endedAt) : null,
    state,
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

    expect(summary.currentState).toBe("free");
    expect(summary.currentStateMs).toBe(12 * HOUR + 5 * MINUTE);
    expect(summary.totalsMs.work).toBe(0);
    expect(summary.freeMs).toBe(12 * HOUR + 5 * MINUTE);
    expect(formatStatusLine(summary)).toBe(
      "FREE 12h 5m · free 12h 5m",
    );
  });

  it("tracks the open session state and clips today's totals to midnight", () => {
    const now = at("2026-01-15T10:00:00.000Z");
    const summary = summarizeDay(
      [span("2026-01-14T20:00:00.000Z", null, "studying")],
      at("2026-01-14T18:00:00.000Z"),
      now,
    );

    expect(summary.currentState).toBe("studying");
    expect(summary.currentStateMs).toBe(14 * HOUR);
    expect(summary.totalsMs.studying).toBe(12 * HOUR);
    expect(summary.freeMs).toBe(0);
    expect(formatStatusLine(summary)).toBe(
      "STUDYING 14h · study 12h · free 0m",
    );
  });

  it("counts only the in-today slice of a session that crosses midnight", () => {
    const now = at("2026-01-15T10:00:00.000Z");
    const summary = summarizeDay(
      [span("2026-01-14T20:00:00.000Z", "2026-01-15T01:00:00.000Z")],
      at("2026-01-15T01:00:00.000Z"),
      now,
    );

    expect(summary.currentState).toBe("free");
    expect(summary.currentStateMs).toBe(9 * HOUR);
    expect(summary.totalsMs.work).toBe(3 * HOUR);
    expect(summary.freeMs).toBe(9 * HOUR);
    expect(formatStatusLine(summary)).toBe(
      "FREE 9h · work 3h · free 9h",
    );
  });

  it("sums several sessions by state", () => {
    const now = at("2026-01-15T12:00:00.000Z");
    const summary = summarizeDay(
      [
        span("2026-01-14T10:00:00.000Z", "2026-01-14T12:00:00.000Z"),
        span("2026-01-15T06:00:00.000Z", "2026-01-15T07:30:00.000Z", "work"),
        span("2026-01-15T08:00:00.000Z", "2026-01-15T08:10:00.000Z", "studying"),
        span("2026-01-15T11:00:00.000Z", null, "studying"),
      ],
      at("2026-01-15T08:10:00.000Z"),
      now,
    );

    expect(summary.currentState).toBe("studying");
    expect(summary.currentStateMs).toBe(HOUR);
    expect(summary.totalsMs.work).toBe(90 * MINUTE);
    expect(summary.totalsMs.studying).toBe(70 * MINUTE);
    expect(formatStatusLine(summary)).toBe(
      "STUDYING 1h · work 1h 30m · study 1h 10m · free 11h 20m",
    );
  });
});

describe("toStatusJson", () => {
  it("returns minutes for totals and free time", () => {
    const now = at("2026-01-15T12:42:00.000Z");
    const summary = summarizeDay(
      [span("2026-01-15T12:00:00.000Z", null, "studying")],
      at("2026-01-15T11:00:00.000Z"),
      now,
    );

    expect(toStatusJson(summary)).toEqual({
      state: "studying",
      since: "2026-01-15T12:00:00.000Z",
      currentMinutes: 42,
      totals: { studying: 42 },
      freeMinutes: 840,
    });
  });
});
