export type BlockType =
  | "recurring"
  | "event"
  | "task"
  | "mission"
  | "mashwara"
  | "habit"
  | "buffer";

export interface Block {
  start: string;
  end: string;
  title: string;
  type: BlockType;
  drain: number;
  note?: string;
  ref?: { type: BlockType; id: string | null };
}

export interface Recurring {
  id: string;
  title: string;
  start: string;
  end: string;
  kind: "lecture" | "section" | "lab" | "other";
  recurrence: string;
  location?: string | null;
}

export interface Task {
  id: string;
  title: string;
  status: "open" | "done" | "deferred";
  drain_factor: number;
}

export interface Mission {
  id: string;
  title: string;
  priority: number;
  progress: number;
  tasks: Task[];
}

export interface Mashwara {
  id: string;
  title: string;
  estimate_minutes: number;
  deadline?: string | null;
  status: "open" | "done";
  window?: { start: string; end: string };
  route?: string;
  mode?: string;
}

export interface CalEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  hard: boolean;
  location?: string | null;
}

export interface Skipped {
  id: string;
  title: string;
  start: string;
  end: string;
  reason: string;
}

export interface DayPlan {
  date: string;
  title: string;
  blocks: Block[];
  sample?: boolean;
  recurring?: Recurring[];
  missions?: Mission[];
  mashawer?: Mashwara[];
  events?: CalEvent[];
  skipped?: Skipped[];
  capacity?: { drain_budget: number; drain_used: number };
  cut_first?: string[];
  open_questions?: string[];
  travel?: {
    mode_default?: string;
    legs_minutes?: Record<string, number | null>;
    notes?: string;
  };
  calendar?: { primary?: string; event_ids?: Record<string, string> };
}

export interface DayIndex {
  api: string;
  version: 1;
  timezone: "Africa/Cairo";
  updated: string;
  days: string[];
  latest: string | null;
  endpoints: { index: string; day: string; latest: string };
}

export interface LoadDayResult {
  plan: DayPlan | null;
  isFallback: boolean;
}
