import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:your-email@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

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
    const db = await getDB();

    const now = new Date();
    const windowEnd = new Date(now.getTime() + 60 * 1000);

    const todos = await db
      .collection("todos")
      .find({
        completed: false,
      })
      .toArray();

    const startingTodos = [];

    for (const todo of todos) {
      if (!todo.fromTime || !todo.date) {
        continue;
      }

      const eventTime = combineDateTime(todo.date, todo.fromTime);

      if (!eventTime) continue;

      if (eventTime >= now && eventTime <= windowEnd) {
        startingTodos.push(todo);
      }
    }

    if (startingTodos.length > 0) {
      startingTodos.forEach((todo) => {
        console.log("✓ TODO STARTING:", todo.title);
      });
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
