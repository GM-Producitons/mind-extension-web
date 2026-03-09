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
    const windowEnd = new Date(now.getTime() + 60 * 1000); // 1 minute window

    // 1️⃣ Get all incomplete todos
    const todos = await db
      .collection("todos")
      .find({ completed: false })
      .toArray();

    // 2️⃣ Get all subscriptions
    const subscriptions = await db
      .collection("pushSubscriptions")
      .find()
      .toArray();

    const startingTodos = [];

    for (const todo of todos) {
      if (!todo.fromTime || !todo.date) continue;

      const eventTime = combineDateTime(todo.date, todo.fromTime);
      if (!eventTime) continue;

      if (eventTime >= now && eventTime <= windowEnd) {
        startingTodos.push(todo);
      }
    }

    // 3️⃣ Send notifications
    for (const todo of startingTodos) {
      console.log("✓ TODO STARTING:", todo.title);

      for (const sub of subscriptions) {
        try {
          await webpush.sendNotification(
            sub as any,
            JSON.stringify({
              title: "MindExtension Reminder",
              body: todo.title,
              icon: "/icon-192x192.png",
            }),
          );
        } catch (err) {
          console.error("Error sending push to subscription:", err);
        }
      }
    }

    console.log("=== PROCESS EVENTS COMPLETED ===");
    return NextResponse.json({ ok: true, todos: startingTodos.length });
  } catch (error) {
    console.error("=== CRON ERROR ===", error);
    return NextResponse.json({ ok: false, error: String(error) });
  }
}

export async function GET() {
  return POST();
}
