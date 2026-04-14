"use client";

import { dummySprints } from "../data/dummySprints";
import {
  DAY_WIDTH_PX,
  buildDayTicks,
  buildPositionedSprints,
  formatDayLabel,
  getTimelineBounds,
} from "../utils/timeline";

const LANE_HEIGHT = 46;
const BAR_HEIGHT = 30;

export default function GenTimeline() {
  const { rangeStart, rangeEndExclusive } = getTimelineBounds(dummySprints);
  const dayTicks = buildDayTicks(rangeStart, rangeEndExclusive);
  const { positioned, laneCount } = buildPositionedSprints(
    dummySprints,
    rangeStart,
  );

  const timelineWidth = dayTicks.length * DAY_WIDTH_PX;
  const lanesHeight = laneCount * LANE_HEIGHT;

  return (
    <div className="w-full overflow-x-auto pb-8">
      <div className="w-max min-w-full">
        <div className="relative" style={{ width: `${timelineWidth}px` }}>
          <div className="relative pt-4">
            <div className="h-3 w-full rounded-full bg-border" />
            <div className="pointer-events-none absolute inset-x-0 top-2 flex h-8">
              {dayTicks.map((day) => (
                <div
                  key={day.toISOString()}
                  className="relative h-full"
                  style={{ width: `${DAY_WIDTH_PX}px` }}
                >
                  <span className="absolute left-0 top-0 h-3 w-px bg-foreground/25" />
                </div>
              ))}
              <span className="absolute right-0 top-0 h-3 w-px bg-foreground/25" />
            </div>
            <div className="mt-3 flex">
              {dayTicks.map((day) => (
                <div
                  key={`${day.toISOString()}-label`}
                  className="text-[10px] text-muted-foreground"
                  style={{ width: `${DAY_WIDTH_PX}px` }}
                >
                  {formatDayLabel(day)}
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-3" style={{ height: `${lanesHeight}px` }}>
            {positioned.map((event) => {
              const left = event.startDayIndex * DAY_WIDTH_PX;
              const width =
                (event.endDayIndexExclusive - event.startDayIndex) *
                DAY_WIDTH_PX;

              return (
                <div
                  key={`${event.title}-${event.start.toISOString()}`}
                  className="absolute rounded-md px-2 py-1 text-[11px] font-medium text-white shadow-sm"
                  style={{
                    left: `${left}px`,
                    width: `${width}px`,
                    top: `${event.lane * LANE_HEIGHT}px`,
                    height: `${BAR_HEIGHT}px`,
                    backgroundColor: event.color,
                  }}
                  title={`${event.title}: ${formatDayLabel(event.start)} for ${event.days} day(s)`}
                >
                  <span className="line-clamp-1">{event.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
