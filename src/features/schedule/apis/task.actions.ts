"use server";

import {
  createScheduleTaskRecord,
  deleteTasksByMissionIdRecord,
  addTaskIdToMission,
  getTasksByMissionIdRecord,
  updateMissionCompletionRateRecord,
} from "../../../../repositories/schedule.repository";
import type { ScheduleTask } from "../types";

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

export async function getTasksByMissionIdAction(
  missionId: string,
): Promise<
  { success: true; tasks: ScheduleTask[] } | { success: false; error: string }
> {
  try {
    const tasks = await getTasksByMissionIdRecord(missionId);
    return { success: true, tasks };
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return { success: false, error: "Failed to fetch tasks" };
  }
}

export async function updateMissionCompletionRateAction(
  missionId: string,
  newRate: number,
): Promise<{ success: true } | { success: false; error: string }> {
  if (newRate < 0 || newRate > 100) {
    return {
      success: false,
      error: "Completion rate must be between 0 and 100",
    };
  }
  try {
    await updateMissionCompletionRateRecord(missionId, newRate);
    return { success: true };
  } catch (error) {
    console.error("Error updating completion rate:", error);
    return { success: false, error: "Failed to update completion rate" };
  }
}
