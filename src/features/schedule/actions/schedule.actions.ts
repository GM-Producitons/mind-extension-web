"use server";

import { fetchDayPlan, getDashboardStats } from "../services/schedule.service";
import type { LoadDayResult } from "../types/dayplan";

export async function loadDayPlanAction(): Promise<{
  success: boolean;
  data?: LoadDayResult;
  error?: string;
}> {
  try {
    const data = await fetchDayPlan();
    return { success: true, data };
  } catch (error) {
    console.error("loadDayPlanAction", error);
    return { success: false, error: "Could not load day plan" };
  }
}

export async function getScheduleDashboardStatsAction() {
  try {
    const data = await getDashboardStats();
    return { success: true as const, data };
  } catch (error) {
    console.error("getScheduleDashboardStatsAction", error);
    return { success: false as const, error: "Could not load stats" };
  }
}
