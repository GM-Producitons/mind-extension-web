"use client";

import { useRef, useEffect, useMemo, useState } from "react";
import {
  DAY_WIDTH_PX,
  buildDayTicks,
  buildPositionedSprints,
  formatDayLabel,
  getTimelineBounds,
} from "../utils/timeline";
import { provider as horizontalScrollProvider } from "../providers/horizontalScrollProvider";
import { provider as currentDayAutoScrollProvider } from "../providers/currentDayAutoScrollProvider";
import type { TimelineEvent } from "../models/timeline_event";

const LANE_HEIGHT = 30;
const BAR_HEIGHT = 30;
const TIMELINE_EDGE_PADDING = 32;
const LABEL_INSET_PX = 6;
const LABEL_STICKY_OFFSET_PX = 8;
const LABEL_FADE_ZONE_PX = 36;

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

interface GenTimelineProps {
  events: TimelineEvent[];
  onEventClick?: (event: TimelineEvent) => void;
}

export default function GenTimeline({
  events,
  onEventClick,
}: GenTimelineProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollMetrics, setScrollMetrics] = useState({
    scrollLeft: 0,
    viewportWidth: 0,
  });

  useEffect(() => {
    return horizontalScrollProvider(scrollContainerRef);
  }, []);

  const { rangeStart, rangeEndExclusive } = useMemo(
    () => getTimelineBounds(events),
    [events],
  );
  const dayTicks = useMemo(
    () => buildDayTicks(rangeStart, rangeEndExclusive),
    [rangeStart, rangeEndExclusive],
  );
  const { positioned, laneCount } = useMemo(
    () => buildPositionedSprints(events, rangeStart),
    [events, rangeStart],
  );
  const dayMs = 24 * 60 * 60 * 1000;
  const currentDate = new Date();
  const currentDayIndex = Math.min(
    Math.max(
      Math.floor(
        (new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate(),
        ).getTime() -
          new Date(
            rangeStart.getFullYear(),
            rangeStart.getMonth(),
            rangeStart.getDate(),
          ).getTime()) /
          dayMs,
      ),
      0,
    ),
    Math.max(dayTicks.length - 1, 0),
  );

  useEffect(() => {
    return currentDayAutoScrollProvider(scrollContainerRef, {
      rangeStart,
      dayCount: dayTicks.length,
      dayWidthPx: DAY_WIDTH_PX,
    });
  }, [dayTicks.length, rangeStart]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    let rafId = 0;

    const syncMetrics = () => {
      rafId = 0;
      const nextMetrics = {
        scrollLeft: container.scrollLeft,
        viewportWidth: container.clientWidth,
      };

      setScrollMetrics((current) => {
        if (
          current.scrollLeft === nextMetrics.scrollLeft &&
          current.viewportWidth === nextMetrics.viewportWidth
        ) {
          return current;
        }

        return nextMetrics;
      });
    };

    const queueSync = () => {
      if (rafId) {
        return;
      }

      rafId = window.requestAnimationFrame(syncMetrics);
    };

    syncMetrics();
    container.addEventListener("scroll", queueSync, { passive: true });
    window.addEventListener("resize", queueSync);

    return () => {
      container.removeEventListener("scroll", queueSync);
      window.removeEventListener("resize", queueSync);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  const timelineWidth =
    dayTicks.length * DAY_WIDTH_PX + TIMELINE_EDGE_PADDING * 2;
  const lanesHeight = laneCount * LANE_HEIGHT;

  return (
    <div
      ref={scrollContainerRef}
      className="timeline-cosmic-scroll w-full overflow-x-auto pb-8"
    >
      <div className="w-max min-w-full">
        <div className="relative" style={{ width: `${timelineWidth}px` }}>
          {/* timeline pipe */}
          <div className="relative pt-4">
            {/** pipe */}
            <div className="h-3 w-full rounded-full bg-border" />
            <div
              className="pointer-events-none absolute top-0 h-full rounded-none bg-primary/90 ring-1 ring-inset ring-primary/35"
              style={{
                left: `${TIMELINE_EDGE_PADDING + currentDayIndex * DAY_WIDTH_PX}px`,
                width: `${DAY_WIDTH_PX}px`,
                height: `${3 * 4}px`,
                top: `${4 * 4}px`,
              }}
            />
            {/* combined tick + day title */}
            <div
              className="pointer-events-none absolute top-0 flex h-7"
              style={{ left: `${TIMELINE_EDGE_PADDING}px` }}
            >
              {dayTicks.map((day) => (
                <div
                  key={day.toISOString()}
                  className={`flex h-8 flex-col items-start ${
                    day.toDateString() === currentDate.toDateString()
                      ? "text-primary"
                      : ""
                  }`}
                  style={{ width: `${DAY_WIDTH_PX}px` }}
                >
                  <span className="mt-0 h-4 text-[10px] text-muted-foreground">
                    {formatDayLabel(day)}
                  </span>
                  <span
                    className={`h-3 w-px ${
                      day.toDateString() === currentDate.toDateString()
                        ? "bg-primary"
                        : "bg-foreground/25"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-0" style={{ height: `${lanesHeight}px` }}>
            {positioned.map((event) => {
              const left =
                event.startDayIndex * DAY_WIDTH_PX + TIMELINE_EDGE_PADDING;
              const width =
                (event.endDayIndexExclusive - event.startDayIndex) *
                DAY_WIDTH_PX;
              const eventRight = left + width;
              const kind = getEventKind(event);
              const isMarathon = kind === "marathon";
              const viewportLeft = scrollMetrics.scrollLeft;
              const viewportRight = viewportLeft + scrollMetrics.viewportWidth;
              const isEventVisible =
                eventRight > viewportLeft && left < viewportRight;

              const anchoredLabelX = Math.max(
                left + LABEL_INSET_PX,
                viewportLeft + LABEL_STICKY_OFFSET_PX,
              );
              const maxLabelX = Math.max(
                left + LABEL_INSET_PX,
                eventRight - LABEL_INSET_PX,
              );
              const labelX = Math.min(anchoredLabelX, maxLabelX);
              const labelLeft = labelX - left;
              const remainingRightSpace = eventRight - labelX - LABEL_INSET_PX;
              const labelOpacity = isEventVisible
                ? Math.max(
                    0,
                    Math.min(1, remainingRightSpace / LABEL_FADE_ZONE_PX),
                  )
                : 0;
              const maxLabelWidth = Math.max(
                0,
                width - labelLeft - LABEL_INSET_PX,
              );

              const neonShadow = isMarathon
                ? `0 0 8px ${applyAlphaToHex(event.color, "99")}, 0 0 16px ${applyAlphaToHex(event.color, "66")}`
                : `0 0 8px ${applyAlphaToHex(event.color, "CC")}, 0 0 20px ${applyAlphaToHex(event.color, "AA")}, 0 0 30px ${applyAlphaToHex(event.color, "88")}`;

              const background = isMarathon
                ? `linear-gradient(110deg, ${applyAlphaToHex(event.color, "3D")} 0%, ${applyAlphaToHex(event.color, "66")} 50%, ${applyAlphaToHex(event.color, "3D")} 100%)`
                : `linear-gradient(110deg, ${applyAlphaToHex(event.color, "99")} 0%, ${event.color} 55%, ${applyAlphaToHex(event.color, "B3")} 100%)`;

              return (
                <div
                  key={`${event.title}-${event.start.toISOString()}`}
                  className="absolute cursor-pointer overflow-hidden rounded-md rounded-t-none border px-2 py-1 text-[11px] font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5"
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
                  onClick={() => onEventClick?.(event)}
                >
                  <span
                    className="absolute top-1/2 -translate-y-1/2 truncate whitespace-nowrap rounded-sm bg-black/25 px-1 tracking-[0.01em] drop-shadow-[0_0_6px_rgba(255,255,255,0.45)]"
                    style={{
                      left: `${labelLeft}px`,
                      maxWidth: `${maxLabelWidth}px`,
                      opacity: labelOpacity,
                    }}
                  >
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
