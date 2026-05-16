"use server";

import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth-utils";
import {
  loadTasksForCurrentUser,
  validateStoreAndReturnCreatedTaskForCurrentUser,
  type CreateTaskInput,
} from "../services/task.service";

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  return payload?.userId ?? null;
}

export async function createTaskAction(input: CreateTaskInput) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return JSON.parse(
        JSON.stringify({
          success: false,
          task: null,
          error: "Not authenticated",
        }),
      );
    }

    const result = await validateStoreAndReturnCreatedTaskForCurrentUser(
      userId,
      input,
    );

    return JSON.parse(
      JSON.stringify({
        success: result.success,
        task: result.task ?? null,
        error: result.error ?? null,
      }),
    );
  } catch (error) {
    console.error("Error creating task:", error);
    return JSON.parse(
      JSON.stringify({
        success: false,
        task: null,
        error: "Failed to create task",
      }),
    );
  }
}

export async function getTasksAction() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return JSON.parse(
        JSON.stringify({
          success: false,
          tasks: null,
          error: "Not authenticated",
        }),
      );
    }

    const result = await loadTasksForCurrentUser(userId);

    return JSON.parse(
      JSON.stringify({
        success: result.success,
        tasks: result.tasks ?? null,
        error: result.error ?? null,
      }),
    );
  } catch (error) {
    console.error("Error loading tasks:", error);
    return JSON.parse(
      JSON.stringify({
        success: false,
        tasks: null,
        error: "Failed to load tasks",
      }),
    );
  }
}
