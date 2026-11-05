import { describe, expect, it } from "vitest";
import type { ActivitySessionSpan } from "./activity-time";
import { addCairoDays, buildWorkChart } from "./activity-chart";
import { cairoDayStart } from "./activity-time";

const HOUR = 60 * 60 * 1000;

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
    expect(chart.week.bars.every((bar) => bar.totals.trackedMs === 0)).toBe(true);
    expect(chart.week.averages.trackedMs).toBe(0);
    expect(chart.month.bars).toHaveLength(4);
    expect(chart.month.bars.map((bar) => bar.label)).toEqual([
      "Dec 19",
      "Dec 26",
      "Jan 2",
      "Jan 9",
    ]);
    expect(chart.month.averages.trackedMs).toBe(0);
  });

  it("puts one day's work on that day and averages it across the week", () => {
    const chart = buildWorkChart(
      [span("2026-01-15T08:00:00.000Z", "2026-01-15T10:00:00.000Z")],
      now,
    );

    expect(chart.week.bars.map((bar) => bar.totals.trackedMs)).toEqual([
      0,
      0,
      0,
      0,
      0,
      0,
      2 * HOUR,
    ]);
    expect(chart.week.bars[6].byStateMs.work).toBe(2 * HOUR);
    expect(chart.week.bars[6].totals.focusMs).toBe(2 * HOUR);
    expect(chart.week.averages.trackedMs).toBe(Math.floor((2 * HOUR) / 7));
    expect(chart.month.bars[3].totals.trackedMs).toBe(2 * HOUR);
    expect(chart.month.averages.trackedMs).toBe(Math.floor((2 * HOUR) / 28));
  });

  it("splits a session that crosses midnight across the two days", () => {
    const chart = buildWorkChart(
      [span("2026-01-14T20:00:00.000Z", "2026-01-15T01:00:00.000Z")],
      now,
    );

    expect(chart.week.bars[5].totals.trackedMs).toBe(2 * HOUR);
    expect(chart.week.bars[6].totals.trackedMs).toBe(3 * HOUR);
    expect(chart.month.bars[3].totals.trackedMs).toBe(5 * HOUR);
  });

  it("keeps states separate in stacked totals", () => {
    const chart = buildWorkChart(
      [
        span("2026-01-15T06:00:00.000Z", "2026-01-15T07:00:00.000Z", "work"),
        span("2026-01-15T08:00:00.000Z", "2026-01-15T09:00:00.000Z", "studying"),
      ],
      now,
    );

    expect(chart.week.bars[6].byStateMs.work).toBe(HOUR);
    expect(chart.week.bars[6].byStateMs.studying).toBe(HOUR);
    expect(chart.week.bars[6].totals.focusMs).toBe(2 * HOUR);
    expect(chart.week.bars[6].totals.trackedMs).toBe(2 * HOUR);
  });

  it("does not count sleep toward tracked totals", () => {
    const chart = buildWorkChart(
      [
        span("2026-01-15T06:00:00.000Z", "2026-01-15T07:00:00.000Z", "work"),
        span("2026-01-15T04:00:00.000Z", "2026-01-15T05:00:00.000Z", "sleep"),
      ],
      now,
    );

    expect(chart.week.bars[6].totals.trackedMs).toBe(HOUR);
    expect(chart.week.bars[6].totals.sleepMs).toBe(HOUR);
    expect(chart.week.averages.sleepMs).toBe(Math.floor(HOUR / 7));
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

    expect(chart.week.bars.every((bar) => bar.totals.trackedMs === 0)).toBe(true);
    expect(chart.month.bars[0].totals.trackedMs).toBe(HOUR);
    expect(chart.month.bars.slice(1).every((bar) => bar.totals.trackedMs === 0)).toBe(
      true,
    );
  });
});
