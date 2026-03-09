import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";

function combineDateTime(date: Date, time: string) {
  if (!time) return null;

  const [hours, minutes] = time.split(":").map(Number);

  const combined = new Date(date);
  combined.setHours(hours);
  combined.setMinutes(minutes);
  combined.setSeconds(0);
  combined.setMilliseconds(0);

  // Convert from Cairo time (UTC+2) to UTC
  const cairoOffset = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  return new Date(combined.getTime() - cairoOffset);
}

export async function POST() {
  console.log("=== PROCESS EVENTS ROUTE CALLED ===");
  try {
    console.log("Getting database connection...");
    const db = await getDB();
    console.log("Database connected successfully");

    const now = new Date();
    const windowEnd = new Date(now.getTime() + 60 * 1000);

    console.log("Current time (server):", now.toISOString());
    console.log("Window end:", windowEnd.toISOString());

    console.log("Querying todos...");
    const todos = await db
      .collection("todos")
      .find({
        completed: false,
      })
      .toArray();

    console.log(`Found ${todos.length} incomplete todos`);

    for (const todo of todos) {
      console.log(`Processing todo: ${todo.title}`);
      console.log(`  Date: ${todo.date}, FromTime: ${todo.fromTime}`);

      if (!todo.fromTime || !todo.date) {
        console.log("  Skipping: missing date or fromTime");
        continue;
      }

      const eventTime = combineDateTime(todo.date, todo.fromTime);
      console.log(`  Event time calculated: ${eventTime?.toISOString()}`);

      if (!eventTime) {
        console.log("  Skipping: could not calculate event time");
        continue;
      }

      console.log(
        `  Event time >= now: ${eventTime >= now}, Event time <= windowEnd: ${eventTime <= windowEnd}`,
      );

      if (eventTime >= now && eventTime <= windowEnd) {
        console.log("✓ TODO STARTING:", todo.title);
      }
    }

    console.log("=== PROCESS EVENTS COMPLETED ===");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("=== CRON ERROR ===");
    console.error(
      "Error type:",
      error instanceof Error ? error.name : typeof error,
    );
    console.error(
      "Error message:",
      error instanceof Error ? error.message : String(error),
    );
    console.error("Full error:", error);
    return NextResponse.json({ ok: false, error: String(error) });
  }
}

export async function GET() {
  return POST();
}
