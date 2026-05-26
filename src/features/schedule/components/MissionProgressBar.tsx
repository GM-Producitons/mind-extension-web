"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Draggable, {
  type DraggableData,
  type DraggableEvent,
} from "react-draggable";
import { cn } from "@/lib/utils";

interface MissionProgressBarProps {
  value: number;
  onValueCommit: (newValue: number) => void;
  className?: string;
}

const THUMB_SIZE = 20;
const TRACK_HEIGHT = 28; // h-7

export function MissionProgressBar({
  value,
  onValueCommit,
  className,
}: MissionProgressBarProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const [localValue, setLocalValue] = useState(value);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onValueCommitRef = useRef(onValueCommit);

  useEffect(() => {
    onValueCommitRef.current = onValueCommit;
  }, [onValueCommit]);

  // Sync when the external value changes (e.g. after server response)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Observe the wrapper width so bounds stay accurate on resize
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => setTrackWidth(el.getBoundingClientRect().width);
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, []);

  // The thumb travels from x=0 to x=usableWidth
  const usableWidth = Math.max(0, trackWidth - THUMB_SIZE);
  // Derive positions from localValue — no extra state needed
  const thumbX = usableWidth > 0 ? (localValue / 100) * usableWidth : 0;
  const fillWidth = trackWidth > 0 ? (localValue / 100) * trackWidth : 0;
  const thumbTop = (TRACK_HEIGHT - THUMB_SIZE) / 2;

  const handleDrag = useCallback(
    (_: DraggableEvent, data: DraggableData) => {
      if (usableWidth === 0) return;
      const x = Math.max(0, Math.min(usableWidth, data.x));
      const newValue = Math.round((x / usableWidth) * 100);
      setLocalValue(newValue);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        onValueCommitRef.current(newValue);
      }, 500);
    },
    [usableWidth],
  );

  useEffect(
    () => () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    },
    [],
  );

  return (
    <div className={cn("flex items-center gap-3 ", className)}>
      {/* Wrapper — measured for width, not overflow-hidden so thumb isn't clipped */}
      <div ref={wrapperRef} className="relative h-7 flex-1">
        {/* Track + fill — overflow-hidden clips the stripe fill to the pill shape */}
        <div className="absolute inset-0 overflow-hidden rounded-full border border-border bg-muted ">
          <div
            className="h-full"
            style={{
              width: fillWidth,
              backgroundColor:
                "color-mix(in srgb, var(--foreground) 18%, transparent)",
              backgroundImage:
                "repeating-linear-gradient(-45deg, color-mix(in srgb, var(--foreground) 65%, transparent) 0px, color-mix(in srgb, var(--foreground) 65%, transparent) 1.5px, transparent 1.5px, transparent 8px)",
              backgroundSize: "11px 11px",
            }}
          />
        </div>

        {/* Draggable thumb — lives on the wrapper layer, never clipped */}
        {trackWidth > 0 && (
          <Draggable
            axis="x"
            nodeRef={thumbRef as React.RefObject<HTMLElement>}
            bounds={{ left: 0, right: usableWidth }}
            position={{ x: thumbX, y: 0 }}
            onDrag={handleDrag}
          >
            <div
              ref={thumbRef}
              className="absolute z-10 cursor-ew-resize rounded-full border-2 border-foreground bg-background shadow-sm"
              style={{
                width: THUMB_SIZE,
                height: THUMB_SIZE,
                top: thumbTop,
                left: 0,
              }}
            />
          </Draggable>
        )}
      </div>

      <span className="w-10 text-right text-sm font-medium tabular-nums">
        {localValue}%
      </span>
    </div>
  );
}
