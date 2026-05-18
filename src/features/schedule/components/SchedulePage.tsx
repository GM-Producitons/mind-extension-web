"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import DayTimeline from "./DayTimeline";

function buildLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatReadableDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

export default function SchedulePage() {
  // const [schedule, setSchedule] = useState<GeneratedDaySchedule | null>(null);
  const [status, setStatus] = useState<string>("Ready to generate a day plan.");
  const [isGenerating, startTransition] = useTransition();

  const today = useMemo(() => new Date(), []);
  const dateKey = useMemo(() => buildLocalDateKey(today), [today]);

  // useEffect(() => {
  //   const loadSchedule = async () => {
  //     const result =
  //       await loadPreviouslyGeneratedDayScheduleForSelectedDateAction(dateKey);
  //     if (result.success && result.schedule) {
  //       setSchedule(result.schedule);
  //       setStatus(
  //         result.schedule.conflicts.length > 0
  //           ? "Loaded draft schedule with conflicts to review."
  //           : "Loaded your latest generated schedule.",
  //       );
  //     }
  //   };

  //   void loadSchedule();
  // }, [dateKey]);

  // const handleGenerate = () => {
  //   startTransition(async () => {
  //     setStatus("Generating your day...");
  //     const result =
  //       await generateAndPersistDayScheduleForSelectedDateAction(dateKey);
  //     if (!result.success || !result.schedule) {
  //       setStatus(result.error ?? "Failed to generate your day.");
  //       return;
  //     }

  //     setSchedule(result.schedule);
  //     setStatus(
  //       result.schedule.conflicts.length > 0
  //         ? "Generated with conflicts. Review the warnings below."
  //         : "Generated successfully.",
  //     );
  //   });
  // };

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        {/* <DayTimeline schedule={{}} isGenerating={isGenerating} /> */}
      </div>
    </main>
  );
}
