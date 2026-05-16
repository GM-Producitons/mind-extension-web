import {
  getGeneratedDaySchedule,
  getLongEventsForDate,
  getTaskRecordsForUser,
  getTodoRecordsForDate,
  upsertGeneratedDaySchedule,
} from "../../../../repositories/schedule.repository";
import type {
  DangerSlot,
  GeneratedDaySchedule,
  RecurrenceRule,
  ScheduleConflict,
  ScheduledBlock,
  TaskCategory,
  TaskItem,
  TimePreference,
} from "../types";

const DAY_START_MINUTE = 6 * 60;
const DAY_END_MINUTE = 24 * 60;
const DANGER_SLOT_THRESHOLD_MINUTES = 90;

interface MinuteRange {
  startMinute: number;
  endMinute: number;
}

export interface GenerateDayScheduleResult {
  success: boolean;
  error?: string;
  schedule?: GeneratedDaySchedule;
}

export interface GetDayScheduleResult {
  success: boolean;
  error?: string;
  schedule?: GeneratedDaySchedule | null;
}

function clampMinuteToScheduleBounds(minute: number) {
  return Math.max(DAY_START_MINUTE, Math.min(DAY_END_MINUTE, minute));
}

function parseHourAndMinuteStringIntoMinutesSinceMidnight(value?: string) {
  if (!value) {
    return null;
  }

  const parts = value.split(":");
  if (parts.length !== 2) {
    return null;
  }

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }

  const asMinute = hours * 60 + minutes;
  if (asMinute < 0 || asMinute > DAY_END_MINUTE) {
    return null;
  }

  return asMinute;
}

function convertDateInputIntoLocalDateKey(input?: string) {
  const date = input ? new Date(input) : new Date();
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function determineWhetherRecurrenceAppliesToDate(
  date: Date,
  recurrence?: RecurrenceRule,
) {
  if (!recurrence) {
    return false;
  }

  if (recurrence.until && date > new Date(recurrence.until)) {
    return false;
  }

  if (recurrence.type === "daily") {
    return true;
  }

  if (recurrence.type === "weekly") {
    if (
      !Array.isArray(recurrence.weekdays) ||
      recurrence.weekdays.length === 0
    ) {
      return false;
    }

    return recurrence.weekdays.includes(date.getDay());
  }

  if (recurrence.type === "advanced") {
    if (Array.isArray(recurrence.weekdays) && recurrence.weekdays.length > 0) {
      return recurrence.weekdays.includes(date.getDay());
    }

    // Advanced RRULE parsing is intentionally deferred.
    return false;
  }

  return false;
}

function normalizeTaskDurationIntoWholeMinutes(value: number) {
  if (!Number.isFinite(value)) {
    return 30;
  }

  return Math.max(15, Math.round(value));
}

function getPreferredSchedulingWindowForTask(
  preference?: TimePreference,
): MinuteRange {
  switch (preference) {
    case "morning":
      return { startMinute: 6 * 60, endMinute: 12 * 60 };
    case "afternoon":
      return { startMinute: 12 * 60, endMinute: 18 * 60 };
    case "evening":
      return { startMinute: 18 * 60, endMinute: 24 * 60 };
    default:
      return { startMinute: DAY_START_MINUTE, endMinute: DAY_END_MINUTE };
  }
}

function sortMinuteRangesByStartTime(ranges: MinuteRange[]) {
  return [...ranges].sort((a, b) => a.startMinute - b.startMinute);
}

function mergeOverlappingMinuteRanges(ranges: MinuteRange[]) {
  const sorted = sortMinuteRangesByStartTime(ranges);
  const merged: MinuteRange[] = [];

  for (const range of sorted) {
    if (merged.length === 0) {
      merged.push({ ...range });
      continue;
    }

    const last = merged[merged.length - 1];
    if (range.startMinute <= last.endMinute) {
      last.endMinute = Math.max(last.endMinute, range.endMinute);
      continue;
    }

    merged.push({ ...range });
  }

  return merged;
}

function calculateAvailableFreeTimeSlots(busyRanges: MinuteRange[]) {
  const merged = mergeOverlappingMinuteRanges(busyRanges);
  const freeSlots: MinuteRange[] = [];
  let cursor = DAY_START_MINUTE;

  for (const busy of merged) {
    if (busy.startMinute > cursor) {
      freeSlots.push({ startMinute: cursor, endMinute: busy.startMinute });
    }
    cursor = Math.max(cursor, busy.endMinute);
  }

  if (cursor < DAY_END_MINUTE) {
    freeSlots.push({ startMinute: cursor, endMinute: DAY_END_MINUTE });
  }

  return freeSlots;
}

function buildDangerSlotsFromAvailableFreeTimeSlots(
  slots: MinuteRange[],
): DangerSlot[] {
  return slots
    .filter(
      (slot) =>
        slot.endMinute - slot.startMinute >= DANGER_SLOT_THRESHOLD_MINUTES,
    )
    .map((slot) => ({
      startMinute: slot.startMinute,
      endMinute: slot.endMinute,
      durationMinutes: slot.endMinute - slot.startMinute,
    }));
}

function appendFixedBlockAndRecordOverlapConflict(
  blocks: ScheduledBlock[],
  conflicts: ScheduleConflict[],
  block: ScheduledBlock,
) {
  const overlap = blocks.find(
    (existing) =>
      existing.startMinute < block.endMinute &&
      block.startMinute < existing.endMinute,
  );

  if (overlap) {
    conflicts.push({
      id: `conflict-${block.id}-${overlap.id}`,
      leftId: block.id,
      rightId: overlap.id,
      message: `Fixed block overlap: ${block.title} overlaps with ${overlap.title}`,
      severity: "warning",
    });
  }

  blocks.push(block);
}

function calculateTaskSchedulingPriorityScore(task: TaskItem, date: Date) {
  const deadlinePenalty = task.deadline
    ? Math.max(
        0,
        Math.floor(
          (new Date(task.deadline).getTime() - date.getTime()) / 86400000,
        ),
      )
    : 99;

  return task.priority * 10 - task.drainFactor - deadlinePenalty;
}

function findFirstValidTimeSlotForTask(
  slots: MinuteRange[],
  duration: number,
  preference?: TimePreference,
) {
  const preferred = getPreferredSchedulingWindowForTask(preference);

  const insidePreferred = slots.find((slot) => {
    const start = Math.max(slot.startMinute, preferred.startMinute);
    const end = Math.min(slot.endMinute, preferred.endMinute);
    return end - start >= duration;
  });

  if (insidePreferred) {
    const start = Math.max(insidePreferred.startMinute, preferred.startMinute);
    return {
      slot: insidePreferred,
      startMinute: start,
      endMinute: start + duration,
    };
  }

  const fallback = slots.find(
    (slot) => slot.endMinute - slot.startMinute >= duration,
  );
  if (!fallback) {
    return null;
  }

  return {
    slot: fallback,
    startMinute: fallback.startMinute,
    endMinute: fallback.startMinute + duration,
  };
}

function normalizeTaskCategoryValue(value: unknown): TaskCategory {
  if (
    value === "study" ||
    value === "work" ||
    value === "gym" ||
    value === "personal" ||
    value === "meshwar"
  ) {
    return value;
  }

  return "personal";
}

function normalizeTaskRecordIntoSchedulingTaskItem(value: TaskItem): TaskItem {
  return {
    ...value,
    category: normalizeTaskCategoryValue(value.category),
    estimatedDurationMinutes: normalizeTaskDurationIntoWholeMinutes(
      value.estimatedDurationMinutes,
    ),
    priority: Math.max(1, Math.min(10, Math.round(value.priority))),
    drainFactor: Math.max(1, Math.min(10, Math.round(value.drainFactor))),
  };
}

export async function loadPreviouslyGeneratedDayScheduleForSelectedDate(
  userId: string,
  dateInput?: string,
): Promise<GetDayScheduleResult> {
  const dateKey = convertDateInputIntoLocalDateKey(dateInput);
  if (!dateKey) {
    return { success: false, error: "Date is invalid" };
  }

  const schedule = await getGeneratedDaySchedule(userId, dateKey);
  return { success: true, schedule };
}

export async function generateAndPersistDayScheduleForCurrentUserForSelectedDate(
  userId: string,
  dateInput?: string,
): Promise<GenerateDayScheduleResult> {
  const dateKey = convertDateInputIntoLocalDateKey(dateInput);
  if (!dateKey) {
    return { success: false, error: "Date is invalid" };
  }

  const targetDate = new Date(`${dateKey}T00:00:00`);

  const [taskRecords, todoRecords, longEvents] = await Promise.all([
    getTaskRecordsForUser(userId),
    getTodoRecordsForDate(userId, dateKey),
    getLongEventsForDate(dateKey),
  ]);

  const tasks = taskRecords.map(normalizeTaskRecordIntoSchedulingTaskItem);
  const blocks: ScheduledBlock[] = [];
  const conflicts: ScheduleConflict[] = [];

  for (const todo of todoRecords) {
    const startMinute =
      parseHourAndMinuteStringIntoMinutesSinceMidnight(
        String(todo.fromTime ?? ""),
      ) ?? 9 * 60;
    const defaultEnd = startMinute + 60;
    const until =
      parseHourAndMinuteStringIntoMinutesSinceMidnight(
        String(todo.untilTime ?? ""),
      ) ?? defaultEnd;
    const endMinute = until <= startMinute ? startMinute + 60 : until;

    appendFixedBlockAndRecordOverlapConflict(blocks, conflicts, {
      id: `todo-${todo._id?.toString() ?? `${startMinute}`}`,
      sourceId: todo._id?.toString(),
      title: String(todo.title ?? "Todo"),
      source: "fixed",
      category: normalizeTaskCategoryValue(todo.category),
      startMinute: clampMinuteToScheduleBounds(startMinute),
      endMinute: clampMinuteToScheduleBounds(endMinute),
      isFixed: true,
    });
  }

  for (const event of longEvents) {
    appendFixedBlockAndRecordOverlapConflict(blocks, conflicts, {
      id: `event-${event.id}`,
      sourceId: event.id,
      title: `${event.title} (long event)`,
      source: "event",
      category: "event",
      startMinute: 7 * 60,
      endMinute: 8 * 60,
      isFixed: true,
    });
  }

  const candidateTasks = tasks
    .filter((task) => !task.completed)
    .filter((task) => {
      if (task.recurrence) {
        return determineWhetherRecurrenceAppliesToDate(
          targetDate,
          task.recurrence,
        );
      }

      if (task.deadline) {
        return new Date(task.deadline) >= targetDate;
      }

      return true;
    })
    .sort(
      (a, b) =>
        calculateTaskSchedulingPriorityScore(b, targetDate) -
        calculateTaskSchedulingPriorityScore(a, targetDate),
    );

  for (const task of candidateTasks) {
    if (task.isFixed && task.fixedStartTime) {
      const startMinute = parseHourAndMinuteStringIntoMinutesSinceMidnight(
        task.fixedStartTime,
      );
      if (startMinute === null) {
        conflicts.push({
          id: `conflict-bad-time-${task.id}`,
          leftId: task.id,
          message: `Fixed task ${task.title} is missing a valid fixed time`,
          severity: "warning",
        });
        continue;
      }

      const desiredDuration = normalizeTaskDurationIntoWholeMinutes(
        task.estimatedDurationMinutes,
      );
      const endFromInput = parseHourAndMinuteStringIntoMinutesSinceMidnight(
        task.fixedEndTime,
      );
      const endMinute =
        endFromInput && endFromInput > startMinute
          ? endFromInput
          : startMinute + desiredDuration;

      appendFixedBlockAndRecordOverlapConflict(blocks, conflicts, {
        id: `task-fixed-${task.id}`,
        sourceId: task.id,
        title: task.title,
        source: task.recurrence ? "recurring" : "fixed",
        category: task.category,
        startMinute: clampMinuteToScheduleBounds(startMinute),
        endMinute: clampMinuteToScheduleBounds(endMinute),
        isFixed: true,
      });

      continue;
    }

    let remaining = normalizeTaskDurationIntoWholeMinutes(
      task.estimatedDurationMinutes,
    );
    const minimumChunk = task.splittable ? 30 : remaining;

    while (remaining > 0) {
      const busyRanges = blocks.map((block) => ({
        startMinute: block.startMinute,
        endMinute: block.endMinute,
      }));

      const freeSlots = calculateAvailableFreeTimeSlots(busyRanges);
      const desiredChunk = task.splittable
        ? Math.min(remaining, 90)
        : remaining;
      const requestedChunk = Math.max(minimumChunk, desiredChunk);

      const placement = findFirstValidTimeSlotForTask(
        freeSlots,
        requestedChunk,
        task.preferredTime,
      );

      if (!placement) {
        conflicts.push({
          id: `conflict-unscheduled-${task.id}-${remaining}`,
          leftId: task.id,
          message: `Not enough room to schedule ${task.title} (${remaining} min left)`,
          severity: "warning",
        });
        break;
      }

      blocks.push({
        id: `task-${task.id}-${remaining}`,
        sourceId: task.id,
        title: task.title,
        source: task.recurrence ? "recurring" : "generated",
        category: task.category,
        startMinute: placement.startMinute,
        endMinute: placement.endMinute,
        isFixed: false,
      });

      remaining -= placement.endMinute - placement.startMinute;
      if (!task.splittable) {
        break;
      }
    }
  }

  const sortedBlocks = [...blocks].sort(
    (a, b) => a.startMinute - b.startMinute,
  );

  const freeSlots = calculateAvailableFreeTimeSlots(
    sortedBlocks.map((block) => ({
      startMinute: block.startMinute,
      endMinute: block.endMinute,
    })),
  );

  const schedule: GeneratedDaySchedule = {
    userId,
    dateKey,
    blocks: sortedBlocks,
    dangerSlots: buildDangerSlotsFromAvailableFreeTimeSlots(freeSlots),
    conflicts,
    generatedAt: new Date(),
  };

  const persisted = await upsertGeneratedDaySchedule(schedule);

  return {
    success: true,
    schedule: persisted,
  };
}
