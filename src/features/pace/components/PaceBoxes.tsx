import { cn } from "@/lib/utils";
import { paceDoneStyle, pacePaint } from "../lib/colors";
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
  color,
  done,
  owed,
  recentDone,
  recentExpected,
  size,
}: {
  icon: string;
  color: string;
  done: number;
  owed: number;
  recentDone: number;
  recentExpected: number;
  size: 12 | 14;
}) {
  const paint = pacePaint(color);
  const iconSize = size === 14 ? 32 : 28;
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
            ? paceDoneStyle(paint, size)
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

  const tail = boxes.length > 0 ? boxes[boxes.length - 1] : null;
  const head = tail ? boxes.slice(0, -1) : boxes;

  return (
    <div className="flex items-start gap-[3px]">
      <span
        className="inline-flex shrink-0"
        style={{ width: iconSize, height: iconSize, color: paint }}
      >
        <PaceIcon name={icon} className="block size-full" />
      </span>
      <div
        className="flex min-w-0 flex-1 flex-wrap items-center gap-[3px]"
        style={{ paddingTop: (iconSize - size) / 2 }}
      >
        {head}
        <span className="inline-flex shrink-0 items-center gap-[3px]">
          {tail}
          <PaceArrow size={size} color={paint} />
        </span>
      </div>
    </div>
  );
}

function PaceArrow({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      className="block shrink-0"
      aria-hidden
    >
      <path
        d="M4 2.25 8 6 4 9.75"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
