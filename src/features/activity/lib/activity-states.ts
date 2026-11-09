export const ACTIVITY_STATES = [
  "work",
  "personal_projects",
  "praying",
  "eating",
  "with_friends",
  "mashawer",
  "studying",
  "training",
  "sleep",
  "free",
] as const;

export type ActivityState = (typeof ACTIVITY_STATES)[number];

export type StoredActivityState = Exclude<ActivityState, "free">;

export const STORED_ACTIVITY_STATES: StoredActivityState[] =
  ACTIVITY_STATES.filter((state): state is StoredActivityState => state !== "free");

/** Stored states that count toward tracked time (sleep excluded). */
export const TRACKED_ACTIVITY_STATES: StoredActivityState[] =
  STORED_ACTIVITY_STATES.filter((state) => state !== "sleep");

/** States drawn in the stacked activity chart (sleep excluded). */
export const CHART_BAR_STATES: StoredActivityState[] = TRACKED_ACTIVITY_STATES;

/** Work, study, and personal projects rolled into the focus total. */
export const FOCUS_ACTIVITY_STATES = [
  "work",
  "studying",
  "personal_projects",
] as const satisfies readonly StoredActivityState[];

const STATE_SET = new Set<string>(ACTIVITY_STATES);

export function isActivityState(value: string): value is ActivityState {
  return STATE_SET.has(value);
}

/** Short labels for today's totals in the status line. */
export const STATUS_TOTAL_LABELS: Record<StoredActivityState, string> = {
  work: "work",
  personal_projects: "personal",
  praying: "praying",
  eating: "eating",
  with_friends: "friends",
  mashawer: "mashawer",
  studying: "study",
  training: "training",
  sleep: "sleep",
};

export const ACTIVITY_ROLLUP_LABELS = {
  focus: "focus",
  training: "training",
  tracked: "tracked",
  sleep: "sleep",
} as const;

export interface ActivityRollupTotals {
  focusMs: number;
  trainingMs: number;
  trackedMs: number;
  sleepMs: number;
}

export function focusTotalMs(
  byStateMs: Record<StoredActivityState, number>,
): number {
  return FOCUS_ACTIVITY_STATES.reduce((sum, state) => sum + byStateMs[state], 0);
}

export function trainingTotalMs(
  byStateMs: Record<StoredActivityState, number>,
): number {
  return byStateMs.training;
}

export function trackedTotalMs(
  byStateMs: Record<StoredActivityState, number>,
): number {
  return TRACKED_ACTIVITY_STATES.reduce((sum, state) => sum + byStateMs[state], 0);
}

export function sleepTotalMs(
  byStateMs: Record<StoredActivityState, number>,
): number {
  return byStateMs.sleep;
}

export function rollupTotals(
  byStateMs: Record<StoredActivityState, number>,
): ActivityRollupTotals {
  return {
    focusMs: focusTotalMs(byStateMs),
    trainingMs: trainingTotalMs(byStateMs),
    trackedMs: trackedTotalMs(byStateMs),
    sleepMs: sleepTotalMs(byStateMs),
  };
}

export function formatCurrentStateHeading(state: ActivityState): string {
  if (state === "free") return "FREE";
  return state.replaceAll("_", " ").toUpperCase();
}

export function emptyStateTotalsMs(): Record<StoredActivityState, number> {
  return {
    work: 0,
    personal_projects: 0,
    praying: 0,
    eating: 0,
    with_friends: 0,
    mashawer: 0,
    studying: 0,
    training: 0,
    sleep: 0,
  };
}
