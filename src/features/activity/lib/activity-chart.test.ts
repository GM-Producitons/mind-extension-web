import { describe, expect, it } from "vitest";
import type { ActivitySessionSpan } from "./activity-time";
import { addCairoDays, buildWorkChart } from "./activity-chart";
import { cairoDayStart } from "./activity-time";

const HOUR = 60 * 60 * 1000;

function at(iso: string): Date {
  return new Date(iso);
}

function span(startedAt: string, endedAt: string | null): ActivitySessionSpan {
  return {
    startedAt: at(startedAt),
    endedAt: endedAt ? at(endedAt) : null,
    lastNudgedAt: null,
  };
}

const now = at("2026-01-15T10:00:00.000Z");

describe("addCairoDays", () => {
  it("steps across Cairo midnights in winter and summer", () => {
    expect(addCairoDays(cairoDayStart(now), -1).toISOString()).toBe(
      "2026-01-13T22:00:00.000Z",
    );
    expect(
      addCairoDays(cairoDayStart(at("2026-06-15T09:00:00.000Z")), -1).toISOString(),
    ).toBe("2026-06-13T21:00:00.000Z");
  });
});

describe("buildWorkChart", () => {
  it("returns empty week days and four weeks when there are no sessions", () => {
    const chart = buildWorkChart([], now);

    expect(chart.week.bars.map((bar) => bar.label)).toEqual([
      "Fri",
      "Sat",
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
    ]);
    expect(chart.week.bars.every((bar) => bar.workMs === 0)).toBe(true);
    expect(chart.week.averageMs).toBe(0);
    expect(chart.month.bars).toHaveLength(4);
    expect(chart.month.bars.map((bar) => bar.label)).toEqual([
      "Dec 19",
      "Dec 26",
      "Jan 2",
      "Jan 9",
    ]);
    expect(chart.month.averageMs).toBe(0);
  });

  it("puts one day's work on that day and averages it across the week", () => {
    const chart = buildWorkChart(
      [span("2026-01-15T08:00:00.000Z", "2026-01-15T10:00:00.000Z")],
      now,
    );

    expect(chart.week.bars.map((bar) => bar.workMs)).toEqual([
      0,
      0,
      0,
      0,
      0,
      0,
      2 * HOUR,
    ]);
    expect(chart.week.averageMs).toBe(Math.floor((2 * HOUR) / 7));
    expect(chart.month.bars[3].workMs).toBe(2 * HOUR);
    expect(chart.month.averageMs).toBe(Math.floor((2 * HOUR) / 28));
  });

  it("splits a session that crosses midnight across the two days", () => {
    const chart = buildWorkChart(
      [span("2026-01-14T20:00:00.000Z", "2026-01-15T01:00:00.000Z")],
      now,
    );

    expect(chart.week.bars[5].workMs).toBe(2 * HOUR);
    expect(chart.week.bars[6].workMs).toBe(3 * HOUR);
    expect(chart.month.bars[3].workMs).toBe(5 * HOUR);
  });

  it("keeps an earlier week out of the last-seven-days view", () => {
    const firstDay = addCairoDays(cairoDayStart(now), -27);
    const chart = buildWorkChart(
      [
        span(
          new Date(firstDay.getTime() + 2 * HOUR).toISOString(),
          new Date(firstDay.getTime() + 3 * HOUR).toISOString(),
        ),
      ],
      now,
    );

    expect(chart.week.bars.every((bar) => bar.workMs === 0)).toBe(true);
    expect(chart.month.bars[0].workMs).toBe(HOUR);
    expect(chart.month.bars.slice(1).every((bar) => bar.workMs === 0)).toBe(true);
  });
});
