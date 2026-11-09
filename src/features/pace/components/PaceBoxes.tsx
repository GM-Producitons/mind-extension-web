import { cn } from "@/lib/utils";
import type { PaceStatus } from "../types";
import { PaceIcon } from "./PaceIcon";

const MAX_BOXES = 240;

export function PaceCaption({
  children,
  trailing,
}: {
  children: string;
  trailing?: string;
}) {
  return (
    <div className="flex items-center gap-2 px-3 pt-3">
      <span className="font-pixel text-[10px] tracking-wide text-muted-foreground uppercase">
        {children}
      </span>
      <span className="flex-1 border-b border-dashed border-border" />
      {trailing ? (
        <span className="font-pixel text-[10px] text-muted-foreground">{trailing}</span>
      ) : null}
    </div>
  );
}

export function PaceStatusTag({
  status,
  owed,
}: {
  status: PaceStatus;
  owed: number;
}) {
  const label =
    status === "behind"
      ? `BEHIND ${owed}`
      : status === "ahead"
        ? `+${Math.abs(owed)} AHEAD`
        : status === "on_pace"
          ? "ON PACE"
          : "NEW";
  return (
    <span
      className={cn(
        "font-pixel shrink-0 border px-1 py-0.5 text-[10px] leading-none tracking-wide",
        status === "behind" && "border-destructive text-destructive",
        status === "ahead" && "border-pace-done text-pace-done",
        (status === "on_pace" || status === "new") && "border-border text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
}

export function PaceBoxes({
  icon,
  done,
  owed,
  recentDone,
  recentExpected,
  size,
}: {
  icon: string;
  done: number;
  owed: number;
  recentDone: number;
  recentExpected: number;
  size: 12 | 14;
}) {
  const hatched = Math.max(0, owed);
  const total = done + hatched;
  const visibleStart = Math.max(0, total - MAX_BOXES);
  const blinkDoneFrom = done - Math.min(recentDone, done);
  const blinkOwedFrom = total - Math.min(recentExpected, hatched);
  const boxes = [];
  for (let index = visibleStart; index < total; index += 1) {
    const isDone = index < done;
    const blink = isDone ? index >= blinkDoneFrom : index >= blinkOwedFrom;
    boxes.push(
      <span
        key={index}
        className={cn("shrink-0", blink && "pace-box-blink")}
        style={
          isDone
            ? {
                width: size,
                height: size,
                background: "var(--pace-done)",
                boxShadow:
                  "inset 2px 2px 0 var(--pace-done-light), inset -2px -2px 0 var(--pace-done-dark)",
              }
            : {
                width: size,
                height: size,
                border: "2px solid var(--destructive)",
                backgroundImage:
                  "repeating-linear-gradient(-45deg, transparent, transparent 2px, var(--destructive) 2px, var(--destructive) 3px)",
              }
        }
      />,
    );
  }

  return (
    <div className="flex items-start">
      <PaceIcon name={icon} className={size === 14 ? "mt-px size-5 shrink-0" : "mt-px size-4 shrink-0"} />
      <div className="flex flex-wrap items-center gap-[3px]">
        {boxes}
        <span className="font-pixel text-[10px] leading-none text-muted-foreground" aria-hidden>
          {">"}
        </span>
      </div>
    </div>
  );
}
