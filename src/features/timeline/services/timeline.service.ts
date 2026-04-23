import type { TimelineEvent } from "../models/timeline_event";
import {
  createTimelineEventRecord,
  deleteTimelineEventRecord,
  getTimelineEventRecords,
  updateTimelineEventRecord,
} from "../lib/timeline.repository";

export interface CreateTimelineEventInput {
  title: string;
  start: string;
  days: number;
  color: string;
  type?: "sprint" | "marathon";
}

export interface CreateTimelineEventResult {
  success: boolean;
  error?: string;
  event?: TimelineEvent & { _id?: string };
}

export interface UpdateTimelineEventInput extends CreateTimelineEventInput {
  eventId: string;
}

export interface UpdateTimelineEventResult {
  success: boolean;
  error?: string;
  event?: TimelineEvent & { _id?: string };
}

export interface DeleteTimelineEventResult {
  success: boolean;
  error?: string;
  deletedCount?: number;
}

export interface GetTimelineEventsResult {
  success: boolean;
  error?: string;
  events?: Array<TimelineEvent & { _id?: string }>;
}

function resolveEventType(input: CreateTimelineEventInput) {
  if (input.type === "sprint" || input.type === "marathon") {
    return input.type;
  }

  return input.days > 21 ? "marathon" : "sprint";
}

function normalizeTimelineEventInput(input: CreateTimelineEventInput) {
  const title = input.title.trim();
  const color = input.color.trim();
  const days = Number(input.days);
  const start = new Date(input.start);

  if (!title) {
    return { error: "Title is required" } as const;
  }

  if (!color) {
    return { error: "Color is required" } as const;
  }

  if (!Number.isFinite(days) || days < 1) {
    return { error: "Days must be at least 1" } as const;
  }

  if (Number.isNaN(start.getTime())) {
    return { error: "Start date is invalid" } as const;
  }

  const event: TimelineEvent = {
    title,
    color,
    days,
    start,
    type: resolveEventType({
      ...input,
      title,
      color,
      days,
      start: input.start,
    }),
  };

  return { event } as const;
}

export async function createTimelineEventService(
  input: CreateTimelineEventInput,
): Promise<CreateTimelineEventResult> {
  const normalized = normalizeTimelineEventInput(input);
  if ("error" in normalized) {
    return { success: false, error: normalized.error };
  }

  const created = await createTimelineEventRecord(normalized.event);
  return {
    success: true,
    event: created.event,
  };
}

export async function updateTimelineEventService(
  input: UpdateTimelineEventInput,
): Promise<UpdateTimelineEventResult> {
  const eventId = input.eventId.trim();
  if (!eventId) {
    return { success: false, error: "Event id is required" };
  }

  const normalized = normalizeTimelineEventInput(input);
  if ("error" in normalized) {
    return { success: false, error: normalized.error };
  }

  const updated = await updateTimelineEventRecord(eventId, normalized.event);
  if (!updated) {
    return { success: false, error: "Event was not found" };
  }

  return {
    success: true,
    event: {
      _id: updated._id?.toString(),
      title: updated.title,
      start: new Date(updated.start),
      days: updated.days,
      color: updated.color,
      type: updated.type,
    },
  };
}

export async function deleteTimelineEventService(
  eventId: string,
): Promise<DeleteTimelineEventResult> {
  const normalizedId = eventId.trim();
  if (!normalizedId) {
    return { success: false, error: "Event id is required" };
  }

  const result = await deleteTimelineEventRecord(normalizedId);
  return {
    success: result.deletedCount > 0,
    deletedCount: result.deletedCount,
    error: result.deletedCount > 0 ? undefined : "Event was not found",
  };
}

export async function getTimelineEventsService(): Promise<GetTimelineEventsResult> {
  try {
    const events = await getTimelineEventRecords();

    return {
      success: true,
      events: events.map((event) => ({
        _id: event._id?.toString(),
        title: event.title,
        start: new Date(event.start),
        days: event.days,
        color: event.color,
        type: event.type,
      })),
    };
  } catch (error) {
    console.error("Error loading timeline events:", error);
    return {
      success: false,
      error: "Failed to load timeline events",
    };
  }
}
