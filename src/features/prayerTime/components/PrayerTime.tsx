"use client";
import { useEffect, useState } from "react";
import { getPrayerTimes } from "../apis/actions";
import { getMe } from "../../apis/user";
import { PrayerApiResponse } from "../models/prayer-times";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { getNextPrayerInfo, type NextPrayerInfo } from "../helpers/prayer";

interface PrayerTimeProps {
  height?: string;
  compact?: boolean;
}

export default function PrayerTime({
  height = "h-40",
  compact = false,
}: PrayerTimeProps) {
  const [prayerTimes, setPrayerTimes] = useState<PrayerApiResponse | null>(
    null,
  );
  const [nextPrayer, setNextPrayer] = useState<NextPrayerInfo | null>(null);
  const [countdown, setCountdown] = useState<string>("");

  const formatCountdown = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const calculateCountdown = (prayerTime: string) => {
    const [prayerHours, prayerMinutes] = prayerTime.split(":").map(Number);
    const now = new Date();
    const prayerDate = new Date();
    prayerDate.setHours(prayerHours, prayerMinutes, 0);

    let diff = Math.floor((prayerDate.getTime() - now.getTime()) / 1000);

    if (diff < 0) {
      // Prayer is tomorrow
      diff += 24 * 60 * 60;
    }

    return diff;
  };

  useEffect(() => {
    async function fetchPrayerTimes() {
      const user = await getMe();
      if (!user) {
        console.error("User not found");
        return;
      }
      const { lat, long } = user;
      const method = 5;
      const school = 1;
      const prayerTimes = await getPrayerTimes(lat, long, method, school);
      setPrayerTimes(prayerTimes);

      if (prayerTimes) {
        const next = getNextPrayerInfo(prayerTimes);
        setNextPrayer(next);
      }
    }
    fetchPrayerTimes();
  }, []);

  useEffect(() => {
    if (!nextPrayer || !prayerTimes) return;

    const updateCountdown = () => {
      const remainingSeconds = calculateCountdown(nextPrayer.time);
      setCountdown(formatCountdown(remainingSeconds));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [nextPrayer, prayerTimes]);

  return (
    <Card className={compact ? height : ""}>
      <CardContent className={compact ? "p-3" : "space-y-4"}>
        {prayerTimes && nextPrayer ? (
          <>
            <div className={`text-center ${compact ? "mb-2" : ""}`}>
              <p
                className={`font-bold ${
                  compact ? "text-lg text-primary" : "text-3xl text-primary"
                }`}
              >
                {nextPrayer.name}
              </p>
              {!compact && (
                <p className="text-sm text-muted-foreground mt-1">
                  {nextPrayer.time12.time} {nextPrayer.time12.am ? "AM" : "PM"}
                </p>
              )}
            </div>
            <div
              className={`text-center ${compact ? "bg-transparent" : "bg-accent"} ${compact ? "p-1" : "p-3"} rounded-lg`}
            >
              <p
                className={`${compact ? "text-xs" : "text-xs text-muted-foreground"} mb-1`}
              >
                {compact ? "In" : "Time Remaining"}
              </p>
              <p
                className={`font-mono font-bold ${
                  compact ? "text-sm text-primary" : "text-2xl text-primary"
                }`}
              >
                {countdown}
              </p>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500 text-xs">Loading...</p>
        )}
      </CardContent>
    </Card>
  );
}
