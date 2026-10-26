"use server";

import { getWorkChart } from "../services/activity.service";

export async function getWorkChartAction() {
  try {
    return await getWorkChart();
  } catch (error) {
    console.error("getWorkChartAction", error);
    return { success: false as const, error: "Could not load work" };
  }
}
