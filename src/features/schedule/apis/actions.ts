"use server";

import {
  createMissionRecord,
  getMissionRecords,
} from "../../../../repositories/schedule.repository";

export async function createMissionAction(data: {
  name: string;
  priority: number;
  deadline: Date;
}) {
  try {
    const mission = await createMissionRecord(data);
    return { success: true, mission };
  } catch (error) {
    console.error("Error creating mission:", error);
    return { success: false, mission: null, error: "Failed to create mission" };
  }
}

export async function getMissionsAction() {
  try {
    const missions = await getMissionRecords();
    return { success: true, missions };
  } catch (error) {
    console.error("Error fetching missions:", error);
    return { success: false, missions: [], error: "Failed to fetch missions" };
  }
}
