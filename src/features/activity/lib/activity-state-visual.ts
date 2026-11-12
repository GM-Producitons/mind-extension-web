import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Briefcase,
  Car,
  Dumbbell,
  GraduationCap,
  Moon,
  Sparkles,
  Utensils,
  Users,
  Wrench,
} from "lucide-react";
import type { StoredActivityState } from "./activity-states";

export function activityStateColor(state: StoredActivityState): string {
  return `var(--activity-${state})`;
}

export const ACTIVITY_STATE_ICONS: Record<StoredActivityState, LucideIcon> = {
  work: Briefcase,
  personal_projects: Wrench,
  praying: Sparkles,
  eating: Utensils,
  with_friends: Users,
  mashawer: Car,
  studying: BookOpen,
  college: GraduationCap,
  training: Dumbbell,
  sleep: Moon,
};

export interface ActivityBarSegment {
  state: StoredActivityState;
  ms: number;
}

export function segmentsFromStates(
  byStateMs: Record<StoredActivityState, number>,
  states: readonly StoredActivityState[],
): ActivityBarSegment[] {
  return states.map((state) => ({ state, ms: byStateMs[state] }));
}
