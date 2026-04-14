"use client";

import { useRef, useEffect } from "react";
import { dummySprints } from "../data/dummySprints";
import {
  DAY_WIDTH_PX,
  buildDayTicks,
  buildPositionedSprints,
  formatDayLabel,
  getTimelineBounds,
} from "../utils/timeline";
import { provider as horizontalScrollProvider } from "../providers/horizontalScrollProvider";
import { provider as currentDayAutoScrollProvider } from "../providers/currentDayAutoScrollProvider";

const LANE_HEIGHT = 30;
const BAR_HEIGHT = 30;
const TIMELINE_EDGE_PADDING_PX = 32;

function getEventKind(event: { type?: "sprint" | "marathon"; days: number }) {
  if (event.type === "sprint" || event.type === "marathon") {
    return event.type;
  }

  return event.days > 21 ? "marathon" : "sprint";
}

function applyAlphaToHex(hexColor: string, alphaHex: string) {
  const sanitized = hexColor.replace("#", "");
  const normalized =
    sanitized.length === 3
      ? sanitized
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : sanitized;

  return `#${normalized}${alphaHex}`;
}

export default function GenTimeline() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return horizontalScrollProvider(scrollContainerRef);
  }, []);

  const { rangeStart, rangeEndExclusive } = getTimelineBounds(dummySprints);
  const dayTicks = buildDayTicks(rangeStart, rangeEndExclusive);
  const { positioned, laneCount } = buildPositionedSprints(
    dummySprints,
    rangeStart,
  );

  useEffect(() => {
    return currentDayAutoScrollProvider(scrollContainerRef, {
      rangeStart,
      dayCount: dayTicks.length,
      dayWidthPx: DAY_WIDTH_PX,
    });
  }, [dayTicks.length, rangeStart]);

  const timelineContentWidth = dayTicks.length * DAY_WIDTH_PX;
  const timelineWidth = timelineContentWidth + TIMELINE_EDGE_PADDING_PX * 2;
  const lanesHeight = laneCount * LANE_HEIGHT;

  return (
    <div ref={scrollContainerRef} className="w-full overflow-x-auto pb-8">
      <div className="w-max min-w-full">
        <div className="relative" style={{ width: `${timelineWidth}px` }}>
          {/* timeline pipe */}
          <div className="relative pt-4">
            {/** pipe */}
            <div
              className="h-3 w-full bg-border"
              style={{ borderRadius: `${TIMELINE_EDGE_PADDING_PX}px` }}
            />
            {/* combined tick + day title */}
            <div
              className="pointer-events-none absolute top-0 flex h-7"
              style={{
                left: `${TIMELINE_EDGE_PADDING_PX}px`,
                width: `${timelineContentWidth}px`,
              }}
            >
              {dayTicks.map((day) => (
                <div
                  key={day.toISOString()}
                  className="flex h-8 flex-col items-start"
                  style={{ width: `${DAY_WIDTH_PX}px` }}
                >
                  <span className="mt-0 text-[10px] text-muted-foreground h-4">
                    {formatDayLabel(day)}
                  </span>
                  <span className="h-3 w-px bg-foreground/25" />
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-0" style={{ height: `${lanesHeight}px` }}>
            {positioned.map((event) => {
              const left =
                TIMELINE_EDGE_PADDING_PX + event.startDayIndex * DAY_WIDTH_PX;
              const width =
                (event.endDayIndexExclusive - event.startDayIndex) *
                DAY_WIDTH_PX;
              const kind = getEventKind(event);
              const isMarathon = kind === "marathon";

              const neonShadow = isMarathon
                ? `0 0 8px ${applyAlphaToHex(event.color, "99")}, 0 0 16px ${applyAlphaToHex(event.color, "66")}`
                : `0 0 8px ${applyAlphaToHex(event.color, "CC")}, 0 0 20px ${applyAlphaToHex(event.color, "AA")}, 0 0 30px ${applyAlphaToHex(event.color, "88")}`;

              const background = isMarathon
                ? `linear-gradient(110deg, ${applyAlphaToHex(event.color, "3D")} 0%, ${applyAlphaToHex(event.color, "66")} 50%, ${applyAlphaToHex(event.color, "3D")} 100%)`
                : `linear-gradient(110deg, ${applyAlphaToHex(event.color, "99")} 0%, ${event.color} 55%, ${applyAlphaToHex(event.color, "B3")} 100%)`;

              return (
                <div
                  key={`${event.title}-${event.start.toISOString()}`}
                  className="absolute rounded-md rounded-t-none border px-2 py-1 text-[11px] font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5"
                  style={{
                    left: `${left}px`,
                    width: `${width}px`,
                    top: `${event.lane * LANE_HEIGHT}px`,
                    height: `${BAR_HEIGHT}px`,
                    background,
                    borderColor: applyAlphaToHex(
                      event.color,
                      isMarathon ? "99" : "E6",
                    ),
                    boxShadow: neonShadow,
                    opacity: isMarathon ? 0.82 : 1,
                  }}
                  title={`${event.title}: ${kind} | ${formatDayLabel(event.start)} for ${event.days} day(s)`}
                >
                  <span className="line-clamp-1 tracking-[0.01em] drop-shadow-[0_0_6px_rgba(255,255,255,0.45)]">
                    {event.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
