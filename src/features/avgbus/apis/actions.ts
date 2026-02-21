"use server";

import { getDB } from "@/lib/db";
import { BusEntry } from "../models/bus_entry";
import { ObjectId } from "mongodb";

export async function addBusEntry(entry: BusEntry) {
  try {
    const db = await getDB();
    const result = await db.collection("bus-entries").insertOne({
      ...entry,
      time: new Date(entry.time),
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
