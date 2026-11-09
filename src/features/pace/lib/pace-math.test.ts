import { describe, expect, it } from "vitest";
import { DEFAULT_PACE_COLOR, resolvePaceColor } from "./colors";
import { parseBarInput, parseBarPatch, parseEntryInput, parseGroupInput, parseGroupPatch, parseRule, slugify } from "./validate";
import {
  addMonthsClamped,
  cairoToday,
  daysBetween,
  foldEntries,
  formatPaceStamp,
  paceStatus,
  periodCount,
  scheduleExpected,
} from "./pace-math";

describe("schedule expected", () => {
  const weekly = { type: "schedule" as const, amount: 4, period: "week" as const };

  it("owes the first period on the start date and the next one 7 days later", () => {
    expect(scheduleExpected(weekly, "2026-09-27", "2026-09-27")).toBe(4);
    expect(daysBetween("2026-09-27", "2026-10-03")).toBe(6);
    expect(scheduleExpected(weekly, "2026-09-27", "2026-10-03")).toBe(4);
    expect(scheduleExpected(weekly, "2026-09-27", "2026-10-04")).toBe(8);
  });

  it("owes nothing before the start date", () => {
    expect(periodCount("week", "2026-09-27", "2026-09-26")).toBe(0);
    expect(scheduleExpected(weekly, "2026-09-27", "2026-09-26")).toBe(0);
  });

  it("counts a day rule on the start date and again the next day", () => {
    const daily = { type: "both" as const, amount: 1, period: "day" as const };
    expect(scheduleExpected(daily, "2026-09-27", "2026-09-27")).toBe(1);
    expect(scheduleExpected(daily, "2026-09-27", "2026-09-28")).toBe(2);
  });

  it("clamps month anniversaries to the original day", () => {
    expect(addMonthsClamped("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonthsClamped("2024-01-31", 1)).toBe("2024-02-29");
    expect(addMonthsClamped("2026-01-31", 2)).toBe("2026-03-31");
    expect(periodCount("month", "2026-01-31", "2026-02-27")).toBe(1);
    expect(periodCount("month", "2026-01-31", "2026-02-28")).toBe(2);
    expect(periodCount("month", "2026-01-31", "2026-03-30")).toBe(2);
    expect(periodCount("month", "2026-01-31", "2026-03-31")).toBe(3);
    expect(periodCount("month", "2024-01-31", "2024-02-28")).toBe(1);
    expect(periodCount("month", "2024-01-31", "2024-02-29")).toBe(2);
  });

  it("ignores schedule fields on an events rule", () => {
    expect(
      scheduleExpected(
        { type: "events", amount: 4, period: "week" },
        "2026-09-27",
        "2026-11-09",
      ),
    ).toBe(0);
  });
});

describe("status", () => {
  it("is new only when both totals are zero", () => {
    expect(paceStatus(0, 0)).toBe("new");
    expect(paceStatus(0, 4)).toBe("behind");
    expect(paceStatus(4, 4)).toBe("on_pace");
    expect(paceStatus(5, 4)).toBe("ahead");
  });
});

describe("foldEntries", () => {
  it("adds expected without subtracting done", () => {
    const now = Date.parse("2026-11-09T12:00:00.000Z");
    const fold = foldEntries(
      [
        {
          id: "old",
          barId: "bar",
          kind: "done",
          amount: 1,
          note: "earlier",
          source: "ui",
          createdAt: now - 48 * 60 * 60 * 1000,
        },
        {
          id: "done",
          barId: "bar",
          kind: "done",
          amount: 2,
          note: "library",
          source: "ui",
          createdAt: now - 1000,
        },
        {
          id: "owed",
          barId: "bar",
          kind: "expected",
          amount: 5,
          note: "lecture",
          source: "grok",
          createdAt: now - 1000,
        },
      ],
      now,
    ).get("bar");

    expect(fold?.done).toBe(3);
    expect(fold?.expectedEntries).toBe(5);
    expect(fold?.recentDone).toBe(2);
    expect(fold?.recentExpected).toBe(5);
    expect(fold?.undo).toEqual({
      id: "done",
      kind: "done",
      amount: 2,
      note: "library",
    });
  });
});

describe("pace color", () => {
  it("uses a bar color, then the group color, then the default token", () => {
    expect(resolvePaceColor("#8b5cf6", "#10b981")).toBe("#8b5cf6");
    expect(resolvePaceColor(null, "#10b981")).toBe("#10b981");
    expect(resolvePaceColor(null, null)).toBe(DEFAULT_PACE_COLOR);
    expect(resolvePaceColor("red", "nope")).toBe(DEFAULT_PACE_COLOR);
  });

  it("accepts a hex color and a cleared color", () => {
    expect(
      parseGroupInput({ name: "College", icon: "graduation-cap", unit: "h", color: "#8B5CF6" }).color,
    ).toBe("#8b5cf6");
    expect(parseGroupPatch({ color: null })).toEqual({ color: null });
    expect(
      parseBarInput({
        name: "OS",
        icon: "cpu",
        unit: "h",
        startDate: "2026-09-01",
        expectedRule: { type: "events" },
        color: null,
      }).color,
    ).toBeNull();
    expect(parseBarPatch({ color: "#112233" })).toEqual({ color: "#112233" });
    expect(() => parseBarPatch({ color: "violet" })).toThrow(/Color/);
  });
});

describe("dates and slugs", () => {
  it("uses the Cairo calendar day", () => {
    expect(cairoToday(new Date("2026-01-15T22:30:00.000Z"))).toBe("2026-01-16");
    expect(cairoToday(new Date("2026-01-15T21:30:00.000Z"))).toBe("2026-01-15");
    expect(cairoToday(new Date("2026-06-15T21:30:00.000Z"))).toBe("2026-06-16");
  });

  it("formats Cairo time in 12-hour form", () => {
    expect(formatPaceStamp(new Date("2026-11-08T21:30:00.000Z"))).toBe("Nov 8, 11:30 pm");
  });

  it("slugifies names and rejects event rules that carry a schedule", () => {
    expect(slugify("OS study hours")).toBe("os-study-hours");
    expect(slugify("Reading ×10 pages")).toBe("reading-10-pages");
    expect(slugify("!!!")).toBe("pace");
    expect(() => parseRule({ type: "events", amount: 1 })).toThrow(/Events rules/);
    expect(parseEntryInput({
      kind: "done",
      amount: 1,
      note: "Library",
      source: "grok",
      idempotencyKey: "os-2026-11-09",
    })).toMatchObject({ idempotencyKey: "os-2026-11-09" });
  });
});
