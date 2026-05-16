"use client";

import type { GeneratedDaySchedule, ScheduledBlock } from "../types";

interface DayTimelineProps {
  schedule: GeneratedDaySchedule | null;
  isGenerating?: boolean;
}

const HOUR_HEIGHT = 64;
const START_HOUR = 6;
const END_HOUR = 24;
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60;

function minuteToTop(minute: number) {
  return ((minute - START_HOUR * 60) / 60) * HOUR_HEIGHT;
}

function minuteToHeight(startMinute: number, endMinute: number) {
  return ((endMinute - startMinute) / 60) * HOUR_HEIGHT;
}

function formatHour(hour: number) {
  return `${hour.toString().padStart(2, "0")}:00`;
}

function categoryClassName(block: ScheduledBlock) {
  switch (block.category) {
    case "study":
      return "bg-blue-500/25 border-blue-500/60";
    case "work":
      return "bg-amber-500/25 border-amber-500/60";
    case "gym":
      return "bg-emerald-500/25 border-emerald-500/60";
    case "meshwar":
      return "bg-fuchsia-500/25 border-fuchsia-500/60";
    case "event":
      return "bg-sky-500/25 border-sky-500/60";
    default:
      return "bg-zinc-500/25 border-zinc-500/60";
  }
}

export default function DayTimeline({
  schedule,
  isGenerating,
}: DayTimelineProps) {
  const hours = Array.from(
    { length: END_HOUR - START_HOUR + 1 },
    (_, index) => {
      return START_HOUR + index;
    },
  );

  return (
    <section className="space-y-4 pt-2">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Timeline
          </h2>
          <p className="text-xs text-muted-foreground">
            Engine output for {schedule?.dateKey ?? "today"}
          </p>
        </div>
        <div className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground">
          {isGenerating
            ? "Generating..."
            : `${schedule?.blocks.length ?? 0} blocks`}
        </div>
      </div>

      <div className="relative overflow-y-auto" style={{ maxHeight: 560 }}>
        <div
          className="relative"
          style={{ height: (TOTAL_MINUTES / 60) * HOUR_HEIGHT }}
        >
          {hours.map((hour) => (
            <div
              key={hour}
              className="absolute left-14 right-0 border-t border-border/70"
              style={{ top: (hour - START_HOUR) * HOUR_HEIGHT }}
            >
              <span className="absolute -top-2 left-0 -translate-x-full pr-3 text-[10px] text-muted-foreground">
                {formatHour(hour)}
              </span>
            </div>
          ))}

          {schedule?.dangerSlots.map((slot) => {
            const top = minuteToTop(slot.startMinute);
            const height = minuteToHeight(slot.startMinute, slot.endMinute);
            return (
              <div
                key={`danger-${slot.startMinute}-${slot.endMinute}`}
                className="absolute left-16 right-0 border-l-2 border-rose-500/60 bg-rose-500/10"
                style={{ top, height }}
              >
                <p className="px-3 py-1.5 text-[11px] font-medium text-rose-100">
                  Danger free slot ({slot.durationMinutes} min)
                </p>
              </div>
            );
          })}

          {schedule?.blocks.map((block) => {
            const top = minuteToTop(block.startMinute);
            const height = Math.max(
              30,
              minuteToHeight(block.startMinute, block.endMinute),
            );
            return (
              <div
                key={block.id}
                className={`absolute left-16 right-4 border-l-2 px-3 py-1.5 ${categoryClassName(block)}`}
                style={{ top, height }}
              >
                <p className="truncate text-xs font-semibold text-foreground">
                  {block.title}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {block.source} •{" "}
                  {Math.max(0, block.endMinute - block.startMinute)} min
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {schedule?.conflicts && schedule.conflicts.length > 0 ? (
        <div className="mt-4 border-l-2 border-amber-500/40 pl-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
            Conflicts
          </p>
          <ul className="mt-2 space-y-1">
            {schedule.conflicts.slice(0, 6).map((conflict) => (
              <li key={conflict.id} className="text-xs text-amber-100/90">
                {conflict.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
