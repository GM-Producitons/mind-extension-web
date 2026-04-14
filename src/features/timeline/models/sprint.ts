export interface TimelineSprint {
  days: number;
  color: string;
  title: string;
  start: Date;
  type?: "sprint" | "marathon";
}

export interface PositionedSprint extends TimelineSprint {
  lane: number;
  startDayIndex: number;
  endDayIndexExclusive: number;
}
