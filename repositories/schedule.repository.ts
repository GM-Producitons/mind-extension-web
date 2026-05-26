import { ObjectId } from "mongodb";
import { getDB, connectMongoose } from "@/lib/db";
import { MissionModel } from "@/features/shared/models/mission.model";
import type { Mission, ScheduleTask } from "../src/features/schedule/types";

// --- Missions (Mongoose) ---

export async function createMissionRecord(data: {
  name: string;
  priority: number;
  deadline: Date;
}): Promise<Mission> {
  await connectMongoose();
  const doc = await MissionModel.create({ ...data, taskIds: [] });
  return JSON.parse(JSON.stringify(doc));
}

export async function getMissionRecords(): Promise<Mission[]> {
  await connectMongoose();
  const docs = await MissionModel.find().sort({ deadline: 1 }).lean();
  return JSON.parse(JSON.stringify(docs));
}

export async function addTaskIdToMission(
  missionId: string,
  taskId: string,
): Promise<void> {
  await connectMongoose();
  await MissionModel.findByIdAndUpdate(missionId, {
    $addToSet: { taskIds: taskId },
  });
}

// --- Tasks (raw MongoDB -> `todos` collection) ---

export async function createScheduleTaskRecord(data: {
  missionId: string;
  title: string;
  date: Date;
  fromTime: string;
  utcFromTime: string;
  untilTime: string;
}): Promise<ScheduleTask> {
  const db = await getDB();
  const now = new Date();
  const result = await db.collection("todos").insertOne({
    ...data,
    completed: false,
    createdAt: now,
  });
  return JSON.parse(
    JSON.stringify({
      _id: result.insertedId,
      ...data,
      completed: false,
      createdAt: now,
    }),
  );
}

export async function deleteTasksByMissionIdRecord(
  missionId: string,
): Promise<number> {
  const db = await getDB();
  const result = await db.collection("todos").deleteMany({ missionId });
  return result.deletedCount;
}

export async function updateMissionRecord(
  id: string,
  data: { name: string; priority: number; deadline: Date },
): Promise<Mission> {
  await connectMongoose();
  const doc = await MissionModel.findByIdAndUpdate(id, data, {
    new: true,
  }).lean();
  if (!doc) throw new Error("Mission not found");
  return JSON.parse(JSON.stringify(doc));
}

export async function deleteMissionRecord(id: string): Promise<void> {
  await connectMongoose();
  await MissionModel.findByIdAndDelete(id);
}

export async function getTasksByMissionIdRecord(
  missionId: string,
): Promise<ScheduleTask[]> {
  const db = await getDB();
  const docs = await db
    .collection("todos")
    .find({ missionId })
    .sort({ createdAt: 1 })
    .toArray();
  return JSON.parse(JSON.stringify(docs));
}

export async function updateMissionCompletionRateRecord(
  missionId: string,
  newRate: number,
): Promise<void> {
  await connectMongoose();
  const mission = await MissionModel.findById(missionId).lean();
  if (!mission) throw new Error("Mission not found");

  const oldRate = (mission as { completionRate?: number }).completionRate ?? 0;
  const diff = newRate - oldRate;

  await MissionModel.findByIdAndUpdate(missionId, { completionRate: newRate });

  if (diff !== 0) {
    const db = await getDB();
    const lastCompletedTask = await db
      .collection("todos")
      .findOne({ missionId, completed: true }, { sort: { createdAt: -1 } });

    if (lastCompletedTask) {
      const currentCF =
        (lastCompletedTask.completionFactor as number | undefined) ?? 0;
      await db
        .collection("todos")
        .updateOne(
          { _id: lastCompletedTask._id },
          { $set: { completionFactor: currentCF + diff } },
        );
    }
  }
}
