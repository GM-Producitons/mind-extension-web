import { PrayerTimes, Coordinates, CalculationMethod } from "adhan";
// import type { ScheduledBlock } from "@/features/schedule/types";

// Alexandria, Egypt
const COORDS = new Coordinates(31.250168, 29.972676);
const PARAMS = CalculationMethod.Egyptian();

function utcDateToLocalMinutes(date: Date, utcOffsetMinutes: number): number {
  const utcMinutes = date.getUTCHours() * 60 + date.getUTCMinutes();
  // Wrap within 24h in case a prayer falls past midnight in UTC
  return (utcMinutes + utcOffsetMinutes + 24 * 60) % (24 * 60);
}

/**
 * Returns fixed prayer blocks for a given date (YYYY-MM-DD).
 * Each block is 15 minutes and marked as isFixed: true.
 * @param utcOffsetMinutes - The user's UTC offset in minutes (e.g. 120 for UTC+2)
 */
export function getPrayerBlocks(
  dateKey: string,
  utcOffsetMinutes: number,
): any[] {
  const date = new Date(`${dateKey}T12:00:00Z`);
  const pt = new PrayerTimes(COORDS, date, PARAMS);

  const prayers: { name: string; time: Date }[] = [
    { name: "Fajr", time: pt.fajr },
    { name: "Dhuhr", time: pt.dhuhr },
    { name: "Asr", time: pt.asr },
    { name: "Maghrib", time: pt.maghrib },
    { name: "Isha", time: pt.isha },
  ];

  return prayers.map((p, i) => {
    const startMinute = utcDateToLocalMinutes(p.time, utcOffsetMinutes);
    return {
      id: `prayer-${i}`,
      title: p.name,
      category: "prayer" as const,
      source: "prayer",
      startMinute,
      endMinute: startMinute + 15,
      isFixed: true,
    };
  });
}
