import {
  createTaskRecord,
  getTaskRecordsForUser,
} from "../../../../repositories/schedule.repository";
import type { TaskCategory, TaskItem, TimePreference } from "../types";

export interface CreateTaskInput {
  title: string;
  peopleInvolved?: string[];
  deadline?: string;
  estimatedDurationMinutes: number;
  drainFactor: number;
  priority: number;
  category: TaskCategory;
  isFixed: boolean;
  preferredTime?: TimePreference;
  splittable: boolean;
  recurrence?: TaskItem["recurrence"];
  fixedStartTime?: string;
  fixedEndTime?: string;
}

export interface CreateTaskResult {
  success: boolean;
  error?: string;
  task?: TaskItem;
}

export interface GetTasksResult {
  success: boolean;
  error?: string;
  tasks?: TaskItem[];
}

function clampIntegerToInclusiveRange(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.max(min, Math.min(max, Math.round(value)));
}

function normalizeAndValidateTaskCreationInput(input: CreateTaskInput) {
  const title = input.title.trim();
  if (!title) {
    return { error: "Task title is required" } as const;
  }

  const estimatedDurationMinutes = Math.max(
    15,
    Math.round(Number(input.estimatedDurationMinutes)),
  );

  if (!Number.isFinite(estimatedDurationMinutes)) {
    return { error: "Estimated duration must be a number" } as const;
  }

  const deadline = input.deadline ? new Date(input.deadline) : undefined;
  if (deadline && Number.isNaN(deadline.getTime())) {
    return { error: "Deadline date is invalid" } as const;
  }

  const taskWithoutId: Omit<TaskItem, "id"> = {
    title,
    peopleInvolved: Array.isArray(input.peopleInvolved)
      ? input.peopleInvolved.map((id) => id.trim()).filter(Boolean)
      : [],
    deadline,
    estimatedDurationMinutes,
    drainFactor: clampIntegerToInclusiveRange(input.drainFactor, 1, 10),
    priority: clampIntegerToInclusiveRange(input.priority, 1, 10),
    category: input.category,
    isFixed: input.isFixed,
    preferredTime: input.preferredTime,
    splittable: Boolean(input.splittable),
    recurrence: input.recurrence,
    fixedStartTime: input.fixedStartTime?.trim() || undefined,
    fixedEndTime: input.fixedEndTime?.trim() || undefined,
    completed: false,
  };

  return { taskWithoutId } as const;
}

export async function validateStoreAndReturnCreatedTaskForCurrentUser(
  userId: string,
  input: CreateTaskInput,
): Promise<CreateTaskResult> {
  const normalized = normalizeAndValidateTaskCreationInput(input);
  if ("error" in normalized) {
    return { success: false, error: normalized.error };
  }

  const task = await createTaskRecord(userId, normalized.taskWithoutId);
  return { success: true, task };
}

export async function loadTasksForCurrentUser(
  userId: string,
): Promise<GetTasksResult> {
  try {
    const tasks = await getTaskRecordsForUser(userId);
    return { success: true, tasks };
  } catch (error) {
    console.error("Error loading tasks:", error);
    return { success: false, error: "Failed to load tasks" };
  }
}
