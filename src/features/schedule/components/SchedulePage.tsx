"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import DayTimeline from "./DayTimeline";
import type { GeneratedDaySchedule } from "../types";
import {
  generateAndPersistDayScheduleForSelectedDateAction,
  loadPreviouslyGeneratedDayScheduleForSelectedDateAction,
} from "../apis/actions";

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
  const [schedule, setSchedule] = useState<GeneratedDaySchedule | null>(null);
  const [status, setStatus] = useState<string>("Ready to generate a day plan.");
  const [isGenerating, startTransition] = useTransition();

  const today = useMemo(() => new Date(), []);
  const dateKey = useMemo(() => buildLocalDateKey(today), [today]);

  useEffect(() => {
    const loadSchedule = async () => {
      const result =
        await loadPreviouslyGeneratedDayScheduleForSelectedDateAction(dateKey);
      if (result.success && result.schedule) {
        setSchedule(result.schedule);
        setStatus(
          result.schedule.conflicts.length > 0
            ? "Loaded draft schedule with conflicts to review."
            : "Loaded your latest generated schedule.",
        );
      }
    };

    void loadSchedule();
  }, [dateKey]);

  const handleGenerate = () => {
    startTransition(async () => {
      setStatus("Generating your day...");
      const result =
        await generateAndPersistDayScheduleForSelectedDateAction(dateKey);
      if (!result.success || !result.schedule) {
        setStatus(result.error ?? "Failed to generate your day.");
        return;
      }

      setSchedule(result.schedule);
      setStatus(
        result.schedule.conflicts.length > 0
          ? "Generated with conflicts. Review the warnings below."
          : "Generated successfully.",
      );
    });
  };

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="space-y-6 border-b border-border/60 pb-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                Daily schedule engine
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Day timeline
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                  A clean hour-by-hour view of tasks, recurring blocks, and the
                  empty spaces you want to keep visible.
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatReadableDate(today)}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-full border border-border/70 px-4 py-2 text-sm text-muted-foreground">
                {status}
              </div>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="gap-2"
              >
                {isGenerating ? "Generating..." : "Generate my day"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        <DayTimeline schedule={schedule} isGenerating={isGenerating} />
      </div>
    </main>
  );
}
