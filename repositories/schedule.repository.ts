import { ObjectId } from "mongodb";
import { getDB } from "@/lib/db";
import type {
  GeneratedDaySchedule,
  LongEvent,
  TaskItem,
} from "../src/features/schedule/types";

const TASKS_COLLECTION = "tasks";
const TODOS_COLLECTION = "todos";
const TIMELINE_COLLECTION = "timeline-events";
const GENERATED_SCHEDULES_COLLECTION = "generated-day-schedules";

function parseDateOnly(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function mapTaskDocument(task: any): TaskItem {
  return {
    id: task._id?.toString() ?? "",
    title: String(task.title ?? "Untitled task"),
    peopleInvolved: Array.isArray(task.peopleInvolved)
      ? task.peopleInvolved.map((id: unknown) => String(id))
      : [],
    deadline: task.deadline ? new Date(task.deadline) : undefined,
    estimatedDurationMinutes: Number(task.estimatedDurationMinutes ?? 60),
    drainFactor: Number(task.drainFactor ?? 5),
    priority: Number(task.priority ?? 5),
    category: (task.category ?? "personal") as TaskItem["category"],
    isFixed: Boolean(task.isFixed),
    preferredTime: task.preferredTime,
    splittable: Boolean(task.splittable),
    recurrence: task.recurrence,
    fixedStartTime: task.fixedStartTime,
    fixedEndTime: task.fixedEndTime,
    completed: Boolean(task.completed),
  };
}

export async function createTaskRecord(
  userId: string,
  task: Omit<TaskItem, "id">,
): Promise<TaskItem> {
  const db = await getDB();
  const result = await db.collection(TASKS_COLLECTION).insertOne({
    userId,
    title: task.title,
    peopleInvolved: task.peopleInvolved,
    deadline: task.deadline ?? null,
    estimatedDurationMinutes: task.estimatedDurationMinutes,
    drainFactor: task.drainFactor,
    priority: task.priority,
    category: task.category,
    isFixed: task.isFixed,
    preferredTime: task.preferredTime ?? null,
    splittable: task.splittable,
    recurrence: task.recurrence ?? null,
    fixedStartTime: task.fixedStartTime ?? null,
    fixedEndTime: task.fixedEndTime ?? null,
    completed: Boolean(task.completed),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return {
    ...task,
    id: result.insertedId.toString(),
  };
}

export async function getTaskRecordsForUser(userId: string) {
  const db = await getDB();
  const maybeObjectId = ObjectId.isValid(userId) ? new ObjectId(userId) : null;

  const userFilter = maybeObjectId
    ? {
        $or: [
          { userId: maybeObjectId },
          { userId },
          { userId: { $exists: false } },
        ],
      }
    : {
        $or: [{ userId }, { userId: { $exists: false } }],
      };

  const tasks = await db
    .collection(TASKS_COLLECTION)
    .find(userFilter)
    .toArray();

  return tasks.map(mapTaskDocument);
}

export async function getTodoRecordsForDate(userId: string, dateKey: string) {
  const db = await getDB();
  const start = parseDateOnly(dateKey);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const maybeObjectId = ObjectId.isValid(userId) ? new ObjectId(userId) : null;
  const userFilter = maybeObjectId
    ? {
        $or: [
          { userId: maybeObjectId },
          { userId },
          { userId: { $exists: false } },
        ],
      }
    : {
        $or: [{ userId }, { userId: { $exists: false } }],
      };

  return db
    .collection(TODOS_COLLECTION)
    .find({
      ...userFilter,
      date: {
        $gte: start,
        $lt: end,
      },
    })
    .toArray();
}

export async function getLongEventsForDate(dateKey: string) {
  const db = await getDB();
  const dayStart = parseDateOnly(dateKey);

  const records = await db.collection(TIMELINE_COLLECTION).find({}).toArray();

  return records
    .map((record): LongEvent => {
      const start = new Date(record.start);
      return {
        id: record._id?.toString() ?? "",
        title: String(record.title ?? "Untitled event"),
        start,
        days: Number(record.days ?? 1),
        color: record.color,
      };
    })
    .filter((event) => {
      const start = new Date(
        event.start.getFullYear(),
        event.start.getMonth(),
        event.start.getDate(),
      );
      const end = new Date(start);
      end.setDate(end.getDate() + Math.max(event.days, 1));
      return dayStart >= start && dayStart < end;
    });
}

export async function upsertGeneratedDaySchedule(
  schedule: GeneratedDaySchedule,
): Promise<GeneratedDaySchedule> {
  const db = await getDB();
  const result = await db
    .collection(GENERATED_SCHEDULES_COLLECTION)
    .findOneAndUpdate(
      {
        userId: schedule.userId,
        dateKey: schedule.dateKey,
      },
      {
        $set: {
          blocks: schedule.blocks,
          dangerSlots: schedule.dangerSlots,
          conflicts: schedule.conflicts,
          generatedAt: schedule.generatedAt,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          userId: schedule.userId,
          dateKey: schedule.dateKey,
          createdAt: new Date(),
        },
      },
      {
        upsert: true,
        returnDocument: "after",
        includeResultMetadata: false,
      },
    );

  return {
    id: result?._id?.toString(),
    userId: String(result?.userId ?? schedule.userId),
    dateKey: String(result?.dateKey ?? schedule.dateKey),
    blocks: (result?.blocks ??
      schedule.blocks) as GeneratedDaySchedule["blocks"],
    dangerSlots: (result?.dangerSlots ??
      schedule.dangerSlots) as GeneratedDaySchedule["dangerSlots"],
    conflicts: (result?.conflicts ??
      schedule.conflicts) as GeneratedDaySchedule["conflicts"],
    generatedAt: new Date(result?.generatedAt ?? schedule.generatedAt),
  };
}

export async function getGeneratedDaySchedule(
  userId: string,
  dateKey: string,
): Promise<GeneratedDaySchedule | null> {
  const db = await getDB();
  const result = await db.collection(GENERATED_SCHEDULES_COLLECTION).findOne({
    userId,
    dateKey,
  });

  if (!result) {
    return null;
  }

  return {
    id: result._id?.toString(),
    userId: String(result.userId),
    dateKey: String(result.dateKey),
    blocks: (result.blocks ?? []) as GeneratedDaySchedule["blocks"],
    dangerSlots: (result.dangerSlots ??
      []) as GeneratedDaySchedule["dangerSlots"],
    conflicts: (result.conflicts ?? []) as GeneratedDaySchedule["conflicts"],
    generatedAt: new Date(result.generatedAt ?? new Date()),
  };
}
