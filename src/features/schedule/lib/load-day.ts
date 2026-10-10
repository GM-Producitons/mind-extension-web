import type { DayPlan, LoadDayResult } from "../types/dayplan";

const BASE = "https://karma-thicket-vj8z.here.now/api/v1";

export function cairoToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo" }).format(
    new Date(),
  );
}

async function getJSON<T>(path: string): Promise<T | null> {
  const r = await fetch(`${BASE}/${path}?t=${Date.now()}`, {
    cache: "no-store",
  });
  if (!r.ok) return null;
  return r.json() as Promise<T>;
}

export async function loadDay(date = cairoToday()): Promise<LoadDayResult> {
  const plan = await getJSON<DayPlan>(`days/${date}.json`);
  if (plan) return { plan, isFallback: false };
  const latest = await getJSON<DayPlan>("latest.json");
  return { plan: latest, isFallback: true };
}
