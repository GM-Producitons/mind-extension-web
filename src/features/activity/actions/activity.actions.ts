"use server";

import {
  getActivityDashboard,
  getWorkChart,
} from "../services/activity.service";

export async function getWorkChartAction() {
  try {
    return await getWorkChart();
  } catch (error) {
    console.error("getWorkChartAction", error);
    return { success: false as const, error: "Could not load activity" };
  }
}

export async function getActivityDashboardAction() {
  try {
    return await getActivityDashboard();
  } catch (error) {
    console.error("getActivityDashboardAction", error);
    return { success: false as const, error: "Could not load activity" };
  }
}
