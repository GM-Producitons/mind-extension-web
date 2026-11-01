export const ACTIVITY_STATES = [
  "work",
  "personal_projects",
  "praying",
  "eating",
  "with_friends",
  "mashawer",
  "studying",
  "college_training",
  "free",
] as const;

export type ActivityState = (typeof ACTIVITY_STATES)[number];

export type StoredActivityState = Exclude<ActivityState, "free">;

export const STORED_ACTIVITY_STATES: StoredActivityState[] =
  ACTIVITY_STATES.filter((state): state is StoredActivityState => state !== "free");

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
  college_training: "training",
};

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
    college_training: 0,
  };
}
