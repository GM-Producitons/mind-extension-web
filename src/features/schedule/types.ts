export type TaskCategory = "study" | "work" | "gym" | "personal" | "meshwar";

export type TimePreference = "morning" | "afternoon" | "evening";

export type RecurrenceType = "daily" | "weekly" | "advanced";

export interface RecurrenceRule {
  type: RecurrenceType;
  interval?: number;
  weekdays?: number[];
  rrule?: string;
  until?: Date;
}

export interface TaskItem {
  id: string;
  title: string;
  peopleInvolved: string[];
  deadline?: Date;
  estimatedDurationMinutes: number;
  drainFactor: number;
  priority: number;
  category: TaskCategory;
  isFixed: boolean;
  preferredTime?: TimePreference;
  splittable: boolean;
  recurrence?: RecurrenceRule;
  fixedStartTime?: string;
  fixedEndTime?: string;
  completed?: boolean;
}

export interface LongEvent {
  id: string;
  title: string;
  start: Date;
  days: number;
  color?: string;
}

export type ScheduleBlockSource = "fixed" | "generated" | "recurring" | "event";

export interface ScheduledBlock {
  id: string;
  sourceId?: string;
  title: string;
  category: TaskCategory | "event";
  source: ScheduleBlockSource;
  startMinute: number;
  endMinute: number;
  isFixed: boolean;
}

export interface DangerSlot {
  startMinute: number;
  endMinute: number;
  durationMinutes: number;
}

export interface ScheduleConflict {
  id: string;
  leftId: string;
  rightId?: string;
  message: string;
  severity: "warning" | "error";
}

export interface GeneratedDaySchedule {
  id?: string;
  userId: string;
  dateKey: string;
  blocks: ScheduledBlock[];
  dangerSlots: DangerSlot[];
  conflicts: ScheduleConflict[];
  generatedAt: Date;
}
