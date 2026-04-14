export interface TimelineSprint {
  days: number;
  color: string;
  title: string;
  start: Date;
}

export interface PositionedSprint extends TimelineSprint {
  lane: number;
  startDayIndex: number;
  endDayIndexExclusive: number;
}
