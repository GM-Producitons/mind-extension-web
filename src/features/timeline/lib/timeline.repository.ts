import { ObjectId } from "mongodb";
import { getDB } from "@/lib/db";
import type { TimelineEvent } from "../models/timeline_event";

const COLLECTION_NAME = "timeline-events";

export interface StoredTimelineEvent extends TimelineEvent {
  _id?: string;
}

export async function createTimelineEventRecord(event: TimelineEvent) {
  const db = await getDB();
  const { _id, ...payload } = event;
  const result = await db.collection(COLLECTION_NAME).insertOne({
    ...payload,
    start: new Date(payload.start),
    createdAt: new Date(),
  });

  return {
    insertedId: result.insertedId.toString(),
    event: {
      _id: result.insertedId.toString(),
      ...event,
    },
  };
}

export async function getTimelineEventRecords() {
  const db = await getDB();
  return db.collection(COLLECTION_NAME).find({}).sort({ start: 1 }).toArray();
}

export async function getTimelineEventRecordById(eventId: string) {
  const db = await getDB();
  return db.collection(COLLECTION_NAME).findOne({
    _id: new ObjectId(eventId),
  });
}

export async function updateTimelineEventRecord(
  eventId: string,
  event: TimelineEvent,
) {
  const db = await getDB();
  const { _id, ...payload } = event;
  const result = await db.collection(COLLECTION_NAME).findOneAndUpdate(
    { _id: new ObjectId(eventId) },
    {
      $set: {
        ...payload,
        start: new Date(payload.start),
        updatedAt: new Date(),
      },
    },
    {
      returnDocument: "after",
      includeResultMetadata: false,
    },
  );

  return result;
}

export async function deleteTimelineEventRecord(eventId: string) {
  const db = await getDB();
  return db.collection(COLLECTION_NAME).deleteOne({
    _id: new ObjectId(eventId),
  });
}
