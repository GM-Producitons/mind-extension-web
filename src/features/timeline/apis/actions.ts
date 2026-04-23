"use server";

import type { CreateTimelineEventInput } from "../services/timeline.service";
import {
  createTimelineEventService,
  deleteTimelineEventService,
  getTimelineEventsService,
  updateTimelineEventService,
} from "../services/timeline.service";

export async function createTimelineEvent(input: CreateTimelineEventInput) {
  try {
    const result = await createTimelineEventService(input);

    return JSON.parse(
      JSON.stringify({
        success: result.success,
        event: result.event ?? null,
        error: result.error ?? null,
      }),
    );
  } catch (error) {
    console.error("Error creating timeline event:", error);
    return JSON.parse(
      JSON.stringify({
        success: false,
        event: null,
        error: "Failed to create timeline event",
      }),
    );
  }
}

export async function getTimelineEvents() {
  try {
    const result = await getTimelineEventsService();

    return JSON.parse(
      JSON.stringify({
        success: result.success,
        events: result.events ?? null,
        error: result.error ?? null,
      }),
    );
  } catch (error) {
    console.error("Error loading timeline events:", error);
    return JSON.parse(
      JSON.stringify({
        success: false,
        events: null,
        error: "Failed to load timeline events",
      }),
    );
  }
}

export async function updateTimelineEvent(
  input: CreateTimelineEventInput & { eventId: string },
) {
  try {
    const result = await updateTimelineEventService(input);

    return JSON.parse(
      JSON.stringify({
        success: result.success,
        event: result.event ?? null,
        error: result.error ?? null,
      }),
    );
  } catch (error) {
    console.error("Error updating timeline event:", error);
    return JSON.parse(
      JSON.stringify({
        success: false,
        event: null,
        error: "Failed to update timeline event",
      }),
    );
  }
}

export async function deleteTimelineEvent(eventId: string) {
  try {
    const result = await deleteTimelineEventService(eventId);

    return JSON.parse(
      JSON.stringify({
        success: result.success,
        deletedCount: result.deletedCount ?? 0,
        error: result.error ?? null,
      }),
    );
  } catch (error) {
    console.error("Error deleting timeline event:", error);
    return JSON.parse(
      JSON.stringify({
        success: false,
        deletedCount: 0,
        error: "Failed to delete timeline event",
      }),
    );
  }
}
