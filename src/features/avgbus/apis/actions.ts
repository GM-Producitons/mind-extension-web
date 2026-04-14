"use server";

import { getDB } from "@/lib/db";
import { BusEntry } from "../models/bus_entry";
import { ObjectId } from "mongodb";

function parseEntryTimeToDate(time: string): Date {
  const [hoursStr, minutesStr] = time.split(":");
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);

  if (
    Number.isInteger(hours) &&
    Number.isInteger(minutes) &&
    hours >= 0 &&
    hours <= 23 &&
    minutes >= 0 &&
    minutes <= 59
  ) {
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  const parsed = new Date(time);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  throw new Error(`Invalid time value: ${time}`);
}

export async function addBusEntry(entry: BusEntry) {
  try {
    const db = await getDB();
    const parsedTime = parseEntryTimeToDate(entry.time);
    const result = await db.collection("bus-entries").insertOne({
      ...entry,
      time: parsedTime,
      createdAt: new Date(),
    });

    return JSON.parse(
      JSON.stringify({
        success: true,
        busEntry: {
          _id: result.insertedId,
          ...entry,
        },
      }),
    );
  } catch (error) {
    console.error("Error adding bus entry:", error);
    return JSON.parse(
      JSON.stringify({ success: false, error: "Failed to add bus entry" }),
    );
  }
}

export async function getBusEntries() {
  try {
    const db = await getDB();
    const entries = await db
      .collection("bus-entries")
      .find({})
      .sort({ time: -1 })
      .toArray();
    return JSON.parse(JSON.stringify({ success: true, entries }));
  } catch (error) {
    console.error("Error fetching bus entries:", error);
    return JSON.parse(
      JSON.stringify({ success: false, error: "Failed to fetch bus entries" }),
    );
  }
}

export async function deleteBusEntry(entryId: string) {
  try {
    const db = await getDB();
    const result = await db.collection("bus-entries").deleteOne({
      _id: new ObjectId(entryId),
    });

    return JSON.parse(
      JSON.stringify({ success: true, deletedCount: result.deletedCount }),
    );
  } catch (error) {
    console.error("Error deleting bus entry:", error);
    return JSON.parse(
      JSON.stringify({ success: false, error: "Failed to delete bus entry" }),
    );
  }
}
