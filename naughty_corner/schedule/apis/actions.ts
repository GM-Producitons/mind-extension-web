"use server";

import { z } from "zod";
import {
  createMissionRecord,
  getMissionRecords,
  updateMissionRecord,
  deleteMissionRecord,
} from "../../../../repositories/schedule.repository";
import type { Mission } from "../types";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const MissionSchema = z.object({
  name: z.string().min(1).max(200),
  priority: z.number().min(1).max(5),
  deadline: z.coerce.date(),
});

export async function createMissionAction(data: {
  name: string;
  priority: number;
  deadline: Date;
}): Promise<ActionResult<Mission>> {
  const parsed = MissionSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Invalid input" };
  try {
    const mission = await createMissionRecord(parsed.data);
    return { success: true, data: mission };
  } catch {
    return { success: false, error: "Failed to create mission" };
  }
}

export async function getMissionsAction(): Promise<ActionResult<Mission[]>> {
  try {
    const missions = await getMissionRecords();
    return { success: true, data: missions };
  } catch {
    return { success: false, error: "Failed to fetch missions" };
  }
}

export async function updateMissionAction(
  id: string,
  data: { name: string; priority: number; deadline: Date },
): Promise<ActionResult<Mission>> {
  if (!id) return { success: false, error: "Missing id" };
  const parsed = MissionSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Invalid input" };
  try {
    const mission = await updateMissionRecord(id, parsed.data);
    return { success: true, data: mission };
  } catch {
    return { success: false, error: "Failed to update mission" };
  }
}

export async function deleteMissionAction(
  id: string,
): Promise<ActionResult<void>> {
  if (!id) return { success: false, error: "Missing id" };
  try {
    await deleteMissionRecord(id);
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Failed to delete mission" };
  }
}
