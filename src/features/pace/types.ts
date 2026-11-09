export type PaceKind = "done" | "expected";
export type PaceSource = "grok" | "ui";
export type PacePeriod = "day" | "week" | "month";
export type PaceStatus = "behind" | "on_pace" | "ahead" | "new";
export type PaceVoidedBy = "ui" | "grok";

export interface ExpectedRule {
  type: "schedule" | "events" | "both";
  amount?: number;
  period?: PacePeriod;
}

export interface PaceUndo {
  id: string;
  kind: PaceKind;
  amount: number;
  note: string;
}

export interface PaceBarView {
  id: string;
  slug: string;
  name: string;
  icon: string;
  unit: string;
  groupId: string | null;
  groupSlug: string | null;
  startDate: string;
  expectedRule: ExpectedRule;
  noteChips: string[];
  order: number;
  archived: boolean;
  createdAt: string;
  done: number;
  expected: number;
  owed: number;
  status: PaceStatus;
  recentDone: number;
  recentExpected: number;
  undo: PaceUndo | null;
}

export interface PaceGroupView {
  id: string;
  slug: string;
  name: string;
  icon: string;
  unit: string;
  order: number;
  archived: boolean;
  createdAt: string;
  done: number;
  expected: number;
  owed: number;
  status: PaceStatus;
  recentDone: number;
  recentExpected: number;
  childCount: number;
  children: PaceBarView[];
}

export interface PaceBoard {
  today: string;
  groups: PaceGroupView[];
  solo: PaceBarView[];
}

export interface PaceEntryView {
  id: string;
  barId: string;
  kind: PaceKind;
  amount: number;
  note: string;
  source: PaceSource;
  date: string;
  idempotencyKey: string | null;
  createdAt: string;
  voidedAt: string | null;
  voidedBy: PaceVoidedBy | null;
}

export interface PaceGroupRecord {
  id: string;
  slug: string;
  name: string;
  icon: string;
  unit: string;
  order: number;
  archived: boolean;
  createdAt: Date;
}

export interface PaceBarRecord {
  id: string;
  slug: string;
  name: string;
  icon: string;
  unit: string;
  groupId: string | null;
  startDate: string;
  expectedRule: ExpectedRule;
  noteChips: string[];
  order: number;
  archived: boolean;
  createdAt: Date;
}

export interface PaceEntryRecord {
  id: string;
  barId: string;
  kind: PaceKind;
  amount: number;
  note: string;
  source: PaceSource;
  date: string;
  idempotencyKey: string | null;
  createdAt: Date;
  voidedAt: Date | null;
  voidedBy: PaceVoidedBy | null;
}

export interface GroupInput {
  name: string;
  icon: string;
  unit: string;
  order?: number;
}

export interface GroupPatch {
  name?: string;
  icon?: string;
  unit?: string;
  order?: number;
  archived?: boolean;
}

export interface BarInput {
  name: string;
  icon: string;
  unit: string;
  groupId?: string | null;
  startDate: string;
  expectedRule: ExpectedRule;
  noteChips?: string[];
  order?: number;
}

export interface BarPatch {
  name?: string;
  icon?: string;
  unit?: string;
  groupId?: string | null;
  startDate?: string;
  expectedRule?: ExpectedRule;
  noteChips?: string[];
  order?: number;
  archived?: boolean;
}

export interface EntryInput {
  kind: PaceKind;
  amount: number;
  note: string;
  source: PaceSource;
  date?: string;
  idempotencyKey?: string;
}

export type PaceActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
