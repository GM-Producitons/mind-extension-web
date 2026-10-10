import type { Block, BlockType, DayPlan } from "../types/dayplan";

export const TIMELINE_START_HOUR = 6;
export const PX_PER_MINUTE = 1.1;

export function parseHm(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function endMinute(start: string, end: string): number {
  const startMinute = parseHm(start);
  let endMinuteValue = parseHm(end);
  if (endMinuteValue <= startMinute) endMinuteValue += 24 * 60;
  return endMinuteValue;
}

export function blockDurationMinutes(block: Block): number {
  return Math.max(endMinute(block.start, block.end) - parseHm(block.start), 1);
}

export function timelineOriginMinutes(blocks: Block[]): number {
  if (blocks.length === 0) return TIMELINE_START_HOUR * 60;
  const minStart = Math.min(...blocks.map((b) => parseHm(b.start)));
  return Math.min(minStart, TIMELINE_START_HOUR * 60);
}

export function blockTopPx(block: Block, originMinutes: number): number {
  return (parseHm(block.start) - originMinutes) * PX_PER_MINUTE;
}

export function blockHeightPx(block: Block): number {
  return blockDurationMinutes(block) * PX_PER_MINUTE;
}

const TYPE_GREY: Record<BlockType, string> = {
  buffer: "bg-muted/40 border-muted-foreground/30",
  recurring: "bg-muted/70 border-muted-foreground/50",
  event: "bg-muted/60 border-muted-foreground/45",
  task: "bg-muted/55 border-muted-foreground/40",
  mission: "bg-muted/65 border-muted-foreground/50",
  mashwara: "bg-muted/75 border-muted-foreground/55",
  habit: "bg-muted/35 border-muted-foreground/25",
};

export function blockTypeClass(type: BlockType): string {
  return TYPE_GREY[type] ?? TYPE_GREY.buffer;
}

export function resolveBlockRef(plan: DayPlan, block: Block): unknown {
  const ref = block.ref;
  if (!ref?.id) return null;
  switch (ref.type) {
    case "recurring":
      return plan.recurring?.find((r) => r.id === ref.id) ?? null;
    case "mashwara":
      return plan.mashawer?.find((m) => m.id === ref.id) ?? null;
    case "event":
      return plan.events?.find((e) => e.id === ref.id) ?? null;
    case "task":
    case "mission":
      for (const mission of plan.missions ?? []) {
        const task = mission.tasks.find((t) => t.id === ref.id);
        if (task) return { mission, task };
        if (mission.id === ref.id) return mission;
      }
      return null;
    default:
      return null;
  }
}

export function dayAlertState(plan: DayPlan): {
  level: "none" | "yellow" | "red";
  tooltip: string;
} {
  const reasons: string[] = [];
  let level: "none" | "yellow" | "red" = "none";

  const budget = plan.capacity?.drain_budget ?? 0;
  const used = plan.capacity?.drain_used ?? 0;
  if (budget > 0 && used > budget) {
    level = "red";
    reasons.push(`Drain over budget (${used}/${budget})`);
  }

  const today = plan.date;
  for (const m of plan.mashawer ?? []) {
    if (m.status !== "open" || !m.deadline) continue;
    if (m.deadline < today) {
      level = "red";
      reasons.push(`Mashwara past deadline: ${m.title}`);
    } else {
      const deadlineDate = new Date(`${m.deadline}T00:00:00`);
      const planDate = new Date(`${today}T00:00:00`);
      const days =
        (deadlineDate.getTime() - planDate.getTime()) / (86400 * 1000);
      if (days <= 2) {
        if (level !== "red") level = "yellow";
        reasons.push(`Mashwara due soon: ${m.title}`);
      }
    }
  }

  if ((plan.open_questions?.length ?? 0) > 0) {
    if (level !== "red") level = "yellow";
    reasons.push("Open questions pending");
  }

  return {
    level,
    tooltip: reasons.join(" · ") || "",
  };
}
