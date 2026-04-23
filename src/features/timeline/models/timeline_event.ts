export interface TimelineEvent {
  _id?: string;
  title: string;
  start: Date;
  days: number;
  color: string;
  type?: "sprint" | "marathon";
}
