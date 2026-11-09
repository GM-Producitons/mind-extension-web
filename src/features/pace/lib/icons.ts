export const PACE_ICONS = [
  { id: "graduation-cap", label: "College" },
  { id: "cpu", label: "OS" },
  { id: "gauge", label: "Control" },
  { id: "network", label: "Networks" },
  { id: "radio", label: "Signals" },
  { id: "dumbbell", label: "Gym" },
  { id: "heart", label: "Brother" },
  { id: "book-open", label: "Reading" },
  { id: "brain", label: "Study" },
  { id: "target", label: "Target" },
  { id: "flag", label: "Flag" },
  { id: "star", label: "Star" },
  { id: "house", label: "Home" },
  { id: "users", label: "People" },
  { id: "activity", label: "Activity" },
  { id: "timer", label: "Timer" },
  { id: "pencil", label: "Notes" },
  { id: "coffee", label: "Coffee" },
  { id: "sun", label: "Day" },
  { id: "zap", label: "Zap" },
] as const;

export type PaceIconId = (typeof PACE_ICONS)[number]["id"];

export function isPaceIcon(value: string): value is PaceIconId {
  return PACE_ICONS.some((icon) => icon.id === value);
}
