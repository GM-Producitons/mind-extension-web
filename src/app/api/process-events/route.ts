import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";

function combineDateTime(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  const combined = new Date(date);
  combined.setHours(hours);
  combined.setMinutes(minutes);
  combined.setSeconds(0);
  combined.setMilliseconds(0);

  return combined;
}

export async function POST() {
  try {
    const db = await getDB();

    const now = new Date();
    const windowEnd = new Date(now.getTime() + 60 * 1000); // next 1 minute

    const todos = await db
      .collection("todos")
      .find({
        completed: false,
      })
      .toArray();

    for (const todo of todos) {
      const eventTime = combineDateTime(todo.date, todo.fromTime);

      if (eventTime >= now && eventTime <= windowEnd) {
        console.log("TODO STARTING:", todo.title);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json({ ok: false });
  }
}
