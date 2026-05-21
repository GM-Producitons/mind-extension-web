export interface Mission {
  _id: string;
  name: string;
  priority: number;
  deadline: Date;
  taskIds: string[];
  createdAt: Date;
  completionRate: number;
}

/** A schedule task is stored in the `todos` collection with an added missionId. */
export interface ScheduleTask {
  _id: string;
  missionId: string;
  title: string;
  date: Date;
  fromTime: string;
  utcFromTime: string;
  untilTime: string;
  completed: boolean;
  createdAt: Date;
}

// ─── DayTimeline types ────────────────────────────────────────────────────────

export type TaskCategory = "study" | "work" | "gym" | "personal" | "meshwar";

export interface ScheduledBlock {
  id: string;
  title: string;
  category: TaskCategory | "event";
  source: string;
  startMinute: number;
  endMinute: number;
  isFixed: boolean;
  sourceId?: string;
}

export interface GeneratedDaySchedule {
  dateKey: string;
  blocks: ScheduledBlock[];
  dangerSlots: {
    startMinute: number;
    endMinute: number;
    durationMinutes: number;
  }[];
  conflicts: { id: string; message: string; severity?: "warning" | "error" }[];
}

export interface ScheduleTask {
  _id: string;
  missionId: string;
  title: string;
  date: Date;
  fromTime: string;
  utcFromTime: string;
  untilTime: string;
  completed: boolean;
  createdAt: Date;
}
