"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  blockHeightPx,
  blockTopPx,
  blockTypeClass,
  endMinute,
  parseHm,
  timelineOriginMinutes,
  PX_PER_MINUTE,
} from "../lib/dayplan-utils";
import type { Block, DayPlan, Skipped } from "../types/dayplan";
import { BlockDetailDrawer } from "./BlockDetailDrawer";

interface DayTimelineProps {
  plan: DayPlan;
}

function rangeStyle(start: string, end: string, originMinutes: number) {
  const top = (parseHm(start) - originMinutes) * PX_PER_MINUTE;
  const height = Math.max((endMinute(start, end) - parseHm(start)) * PX_PER_MINUTE, 1);
  return { top, height };
}

function SkippedMark({
  item,
  originMinutes,
}: {
  item: Skipped;
  originMinutes: number;
}) {
  const start = item.start.includes("T") ? item.start.slice(11, 16) : item.start;
  const end = item.end.includes("T") ? item.end.slice(11, 16) : item.end;
  const { top, height } = rangeStyle(start, end, originMinutes);
  return (
    <div
      className="absolute right-0 left-11 flex items-center px-2"
      style={{ top, height }}
    >
      {height >= 16 ? (
        <p className="truncate text-[10px] text-muted-foreground line-through">
          <span className="font-mono">
            {start}–{end}
          </span>{" "}
          {item.title}
        </p>
      ) : null}
    </div>
  );
}

export function DayTimeline({ plan }: DayTimelineProps) {
  const [selected, setSelected] = useState<Block | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const originMinutes = useMemo(
    () => timelineOriginMinutes(plan.blocks),
    [plan.blocks],
  );

  const maxEnd = useMemo(() => {
    const ends = plan.blocks.map((block) => endMinute(block.start, block.end));
    return Math.max(...ends, originMinutes + 60);
  }, [plan.blocks, originMinutes]);

  const totalHeight = (maxEnd - originMinutes) * PX_PER_MINUTE;

  const hourMarks = useMemo(() => {
    const startHour = Math.floor(originMinutes / 60);
    const endHour = Math.ceil(maxEnd / 60);
    const marks: number[] = [];
    for (let hour = startHour; hour <= endHour; hour++) marks.push(hour);
    return marks;
  }, [originMinutes, maxEnd]);

  const buffers = plan.blocks.filter((block) => block.type === "buffer");
  const blocks = plan.blocks.filter((block) => block.type !== "buffer");

  const openBlock = (block: Block) => {
    setSelected(block);
    setDrawerOpen(true);
  };

  return (
    <>
      <div className="relative border-b border-border">
        <div className="relative" style={{ height: totalHeight }}>
          <div className="absolute top-0 right-0 bottom-0 left-11 bg-destructive/15" />

          {buffers.map((block, index) => {
            const top = blockTopPx(block, originMinutes);
            const height = blockHeightPx(block);
            return (
              <button
                key={`buffer-${block.start}-${index}`}
                type="button"
                onClick={() => openBlock(block)}
                className="absolute right-0 left-11 bg-muted text-left"
                style={{ top, height }}
                aria-label={`${block.start}–${block.end} ${block.title}`}
              >
                {height >= 16 ? (
                  <span className="block truncate px-2 text-[10px] leading-4 text-muted-foreground">
                    <span className="font-mono">
                      {block.start}–{block.end}
                    </span>{" "}
                    {block.title}
                  </span>
                ) : null}
              </button>
            );
          })}

          {hourMarks.map((hour) => {
            const top = (hour * 60 - originMinutes) * PX_PER_MINUTE;
            return (
              <div
                key={hour}
                className="pointer-events-none absolute right-0 left-0 border-t border-border/40"
                style={{ top }}
              >
                <span className="absolute top-0 left-1 -translate-y-1/2 bg-background font-mono text-[10px] text-muted-foreground">
                  {hour.toString().padStart(2, "0")}:00
                </span>
              </div>
            );
          })}

          {(plan.skipped ?? []).map((item) => (
            <SkippedMark key={item.id} item={item} originMinutes={originMinutes} />
          ))}

          {blocks.map((block, index) => {
            const top = blockTopPx(block, originMinutes);
            const height = blockHeightPx(block);
            return (
              <button
                key={`${block.start}-${block.title}-${index}`}
                type="button"
                onClick={() => openBlock(block)}
                className={cn(
                  "absolute right-1 left-12 flex items-center overflow-hidden border px-2 text-left",
                  blockTypeClass(block.type),
                )}
                style={{ top, height }}
              >
                {height >= 16 ? (
                  <p className="truncate text-xs whitespace-nowrap text-foreground">
                    <span className="font-mono text-muted-foreground">
                      {block.start}–{block.end}
                    </span>{" "}
                    {block.title}
                  </p>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <BlockDetailDrawer
        plan={plan}
        block={selected}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </>
  );
}
