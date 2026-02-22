import { PrayerApiResponse } from "../models/prayer-times";
import { convertTo12Hour, type Time12Hour } from "@/lib/utils";

export interface NextPrayerInfo {
  name: string;
  time: string;
  time12: Time12Hour;
}

const convertTimeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

export function getNextPrayerInfo(
  prayerData: PrayerApiResponse,
): NextPrayerInfo {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const prayerNames = Object.keys(prayerData.data.times);
  const prayerTimesArray = Object.values(prayerData.data.times);

  // Find the next prayer
  let nextIndex = -1;
  for (let i = 0; i < prayerTimesArray.length; i++) {
    const prayerMinutes = convertTimeToMinutes(prayerTimesArray[i]);
    if (prayerMinutes > currentMinutes) {
      nextIndex = i;
      break;
    }
  }

  if (nextIndex === -1) {
    // No more prayers today, next is tomorrow's Fajr
    return {
      name: "Fajr (Tomorrow)",
      time: prayerTimesArray[0],
      time12: convertTo12Hour(prayerTimesArray[0]),
    };
  }

  return {
    name: prayerNames[nextIndex],
    time: prayerTimesArray[nextIndex],
    time12: convertTo12Hour(prayerTimesArray[nextIndex]),
  };
}
