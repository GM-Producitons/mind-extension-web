"use server";

import { z } from "zod";
import {
  createRecurringTaskRecord,
  getRecurringTaskRecords,
  deleteRecurringTaskRecord,
} from "../lib/recurring-task.repository";
import type { RecurringTask, WeekDay } from "../types";

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const CreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  fromTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be HH:MM"),
  untilTime: z.string().regex(/^\d{2}:\d{2}$/, "Time must be HH:MM"),
  days: z
    .array(z.number().int().min(0).max(6))
    .min(1, "Select at least one day"),
  category: z.enum(["study", "work", "gym", "personal", "meshwar", "event"]),
});

export async function createRecurringTaskAction(
  raw: Record<string, unknown>,
): Promise<ActionResult<RecurringTask>> {
  const parsed = CreateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((e) => e.message).join(", "),
    };
  }

  try {
    const doc = await createRecurringTaskRecord({
      ...parsed.data,
      days: parsed.data.days as WeekDay[],
    });
    return { success: true, data: doc };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function getRecurringTasksAction(): Promise<
  ActionResult<RecurringTask[]>
> {
  try {
    const docs = await getRecurringTaskRecords();
    return { success: true, data: docs };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function deleteRecurringTaskAction(
  id: string,
): Promise<ActionResult<void>> {
  if (!id) return { success: false, error: "ID is required" };
  try {
    await deleteRecurringTaskRecord(id);
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
