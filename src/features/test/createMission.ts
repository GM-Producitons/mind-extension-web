"use server";

import { getDB } from "@/lib/db";
import { Mission as MissionModel } from "../../../db/mission";

export async function createMission(mission: {
  title: string;
  priority: number;
  deadline: Date;
}) {
  try {
    await getDB();
    const result = await MissionModel.create({ ...mission, tasks: [] });
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error("Error creating mission:", error);
    throw error;
  }
}

export async function getMissions() {
  try {
    await getDB();
    const missions = await MissionModel.find().lean();
    return JSON.parse(JSON.stringify(missions));
  } catch (error) {
    console.error("Error fetching missions:", error);
    throw error;
  }
}
