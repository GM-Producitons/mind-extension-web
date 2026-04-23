import type { TimelineEvent } from "./timeline_event";

export interface TimelineSprint extends TimelineEvent {}

export interface PositionedSprint extends TimelineEvent {
  lane: number;
  startDayIndex: number;
  endDayIndexExclusive: number;
}
