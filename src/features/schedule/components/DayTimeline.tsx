"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  blockHeightPx,
  blockTopPx,
  blockTypeClass,
  parseHm,
  timelineOriginMinutes,
  PX_PER_MINUTE,
} from "../lib/dayplan-utils";
import type { Block, DayPlan, Skipped } from "../types/dayplan";
import { BlockDetailDrawer } from "./BlockDetailDrawer";

interface DayTimelineProps {
  plan: DayPlan;
}

function SkippedGhost({
  item,
  originMinutes,
}: {
  item: Skipped;
  originMinutes: number;
}) {
  const start = item.start.includes("T") ? item.start.slice(11, 16) : item.start;
  const end = item.end.includes("T") ? item.end.slice(11, 16) : item.end;
  const block: Block = {
    start,
    end,
    title: item.title,
    type: "buffer",
    drain: 0,
    note: item.reason,
  };
  const top = blockTopPx(block, originMinutes);
  const height = blockHeightPx(block);

  return (
    <div
      className="absolute left-12 right-2 border border-dashed border-muted-foreground/40 bg-muted/10 px-2 py-1 opacity-60"
      style={{ top, height: Math.max(height, 28) }}
    >
      <p className="line-through text-xs text-muted-foreground">{item.title}</p>
      <p className="text-[10px] text-muted-foreground">{item.reason}</p>
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
    const ends = plan.blocks.map((b) => {
      let end = parseHm(b.end);
      const start = parseHm(b.start);
      if (end <= start) end += 24 * 60;
      return end;
    });
    return Math.max(...ends, originMinutes + 60);
  }, [plan.blocks, originMinutes]);

  const totalHeight = (maxEnd - originMinutes) * PX_PER_MINUTE + 24;

  const hourMarks = useMemo(() => {
    const startHour = Math.floor(originMinutes / 60);
    const endHour = Math.ceil(maxEnd / 60);
    const marks: number[] = [];
    for (let h = startHour; h <= endHour; h++) marks.push(h);
    return marks;
  }, [originMinutes, maxEnd]);

  const openBlock = (block: Block) => {
    setSelected(block);
    setDrawerOpen(true);
  };

  return (
    <>
      <div className="relative border-b border-border bg-background">
        <div className="relative" style={{ height: totalHeight }}>
          {hourMarks.map((hour) => {
            const top = (hour * 60 - originMinutes) * PX_PER_MINUTE;
            return (
              <div
                key={hour}
                className="absolute left-0 right-0 border-t border-border/50"
                style={{ top }}
              >
                <span className="absolute left-1 top-0 -translate-y-1/2 font-mono text-[10px] text-muted-foreground">
                  {hour.toString().padStart(2, "0")}:00
                </span>
              </div>
            );
          })}

          {(plan.skipped ?? []).map((item) => (
            <SkippedGhost key={item.id} item={item} originMinutes={originMinutes} />
          ))}

          {plan.blocks.map((block, index) => {
            const top = blockTopPx(block, originMinutes);
            const height = Math.max(blockHeightPx(block), 32);
            return (
              <button
                key={`${block.start}-${block.title}-${index}`}
                type="button"
                onClick={() => openBlock(block)}
                className={cn(
                  "absolute left-12 right-2 overflow-hidden border px-2 py-1 text-left",
                  blockTypeClass(block.type),
                )}
                style={{ top, height }}
              >
                <p className="text-xs font-medium leading-tight text-foreground">
                  {block.title}
                </p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  {block.start}–{block.end}
                </p>
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
