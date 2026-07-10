import { connectMongoose } from "@/lib/db";
import { RecurringTaskModel } from "@/features/shared/models/recurring-task.model";

import type { CreateRecurringTaskInput, WeekDay } from "../types";

export async function createRecurringTaskRecord(
  data: CreateRecurringTaskInput,
) {
  await connectMongoose();
  const doc = await RecurringTaskModel.create(data);
  return JSON.parse(JSON.stringify(doc));
}

export async function getRecurringTaskRecords() {
  await connectMongoose();
  const docs = await RecurringTaskModel.find().sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(docs));
}

/** Returns only recurring tasks scheduled for the given day of the week. */
export async function getRecurringTaskRecordsForDay(day: WeekDay) {
  await connectMongoose();
  const docs = await RecurringTaskModel.find({ days: day })
    .sort({ fromTime: 1 })
    .lean();
  return JSON.parse(JSON.stringify(docs));
}

export async function deleteRecurringTaskRecord(id: string) {
  await connectMongoose();
  await RecurringTaskModel.findByIdAndDelete(id);
}
