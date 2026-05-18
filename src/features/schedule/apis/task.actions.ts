"use server";

import {
  createScheduleTaskRecord,
  deleteTasksByMissionIdRecord,
  addTaskIdToMission,
} from "../../../../repositories/schedule.repository";

export async function createScheduleTaskAction(data: {
  missionId: string;
  title: string;
  date: Date;
  fromTime?: string;
  untilTime?: string;
}) {
  try {
    const task = await createScheduleTaskRecord({
      missionId: data.missionId,
      title: data.title,
      date: data.date,
      fromTime: data.fromTime ?? "09:00",
      utcFromTime: data.fromTime ?? "09:00",
      untilTime: data.untilTime ?? "10:00",
    });
    await addTaskIdToMission(data.missionId, task._id);
    return { success: true, task };
  } catch (error) {
    console.error("Error creating schedule task:", error);
    return { success: false, task: null, error: "Failed to create task" };
  }
}

export async function deleteTasksByMissionIdAction(missionId: string) {
  try {
    const deletedCount = await deleteTasksByMissionIdRecord(missionId);
    return { success: true, deletedCount };
  } catch (error) {
    console.error("Error deleting tasks:", error);
    return { success: false, deletedCount: 0, error: "Failed to delete tasks" };
  }
}
