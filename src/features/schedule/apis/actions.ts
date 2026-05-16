"use server";

import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth-utils";
import {
  generateAndPersistDayScheduleForCurrentUserForSelectedDate,
  loadPreviouslyGeneratedDayScheduleForSelectedDate,
} from "../services/schedule.service";

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  return payload?.userId ?? null;
}

export async function generateAndPersistDayScheduleForSelectedDateAction(
  dateInput?: string,
) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return JSON.parse(
        JSON.stringify({
          success: false,
          schedule: null,
          error: "Not authenticated",
        }),
      );
    }

    const result =
      await generateAndPersistDayScheduleForCurrentUserForSelectedDate(
        userId,
        dateInput,
      );

    return JSON.parse(
      JSON.stringify({
        success: result.success,
        schedule: result.schedule ?? null,
        error: result.error ?? null,
      }),
    );
  } catch (error) {
    console.error("Error generating day schedule:", error);
    return JSON.parse(
      JSON.stringify({
        success: false,
        schedule: null,
        error: "Failed to generate day schedule",
      }),
    );
  }
}

export async function loadPreviouslyGeneratedDayScheduleForSelectedDateAction(
  dateInput?: string,
) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return JSON.parse(
        JSON.stringify({
          success: false,
          schedule: null,
          error: "Not authenticated",
        }),
      );
    }

    const result = await loadPreviouslyGeneratedDayScheduleForSelectedDate(
      userId,
      dateInput,
    );

    return JSON.parse(
      JSON.stringify({
        success: result.success,
        schedule: result.schedule ?? null,
        error: result.error ?? null,
      }),
    );
  } catch (error) {
    console.error("Error loading day schedule:", error);
    return JSON.parse(
      JSON.stringify({
        success: false,
        schedule: null,
        error: "Failed to load day schedule",
      }),
    );
  }
}
