/** 0 = Sunday … 6 = Saturday — matches JS Date.getDay() */
export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const WEEK_DAY_LABELS: Record<WeekDay, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

export interface RecurringTask {
  _id: string;
  title: string;
  /** "HH:MM" 24-hour format */
  fromTime: string;
  /** "HH:MM" 24-hour format */
  untilTime: string;
  /** Days of the week this task applies to */
  days: WeekDay[];
  category: "study" | "work" | "gym" | "personal" | "meshwar" | "event";
  createdAt: Date;
}

export interface CreateRecurringTaskInput {
  title: string;
  fromTime: string;
  untilTime: string;
  days: WeekDay[];
  category: RecurringTask["category"];
}
