import { NextResponse } from "next/server";
import webpush from "web-push";
import { getDB } from "@/lib/db";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT =
  process.env.VAPID_SUBJECT || "mailto:admin@mindextension.app";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

// Get current date/time parts in Egypt timezone
function getEgyptNow() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value || "";

  return {
    dateStr: `${get("year")}-${get("month")}-${get("day")}`, // "2026-03-04"
    timeStr: `${get("hour")}:${get("minute")}`, // "14:30"
  };
}

export async function GET() {
  try {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      return NextResponse.json(
        { error: "VAPID keys not configured" },
        { status: 500 },
      );
    }

    const db = await getDB();
    const { dateStr, timeStr } = getEgyptNow();

    // Build start/end of today in Egypt timezone to query the date field
    const todayStart = new Date(`${dateStr}T00:00:00+02:00`);
    const todayEnd = new Date(`${dateStr}T23:59:59+02:00`);

    // Find todos that:
    // 1. Have a date that falls on today (Egypt time)
    // 2. Have fromTime matching the current minute (Egypt time)
    // 3. Are not completed
    // 4. Haven't already been notified at this fromTime today
    const todos = await db
      .collection("todos")
      .find({
        date: { $gte: todayStart, $lte: todayEnd },
        fromTime: timeStr,
        completed: { $ne: true },
        notifiedAt: { $ne: dateStr }, // prevent re-notification today
      })
      .toArray();

    if (todos.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No tasks to notify",
        checked: { dateStr, timeStr },
      });
    }

    // Get all subscriptions
    const subscriptions = await db
      .collection("push_subscriptions")
      .find({})
      .toArray();

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No subscriptions found",
      });
    }

    let totalSent = 0;

    for (const todo of todos) {
      const payload = JSON.stringify({
        title: `⏰ ${todo.title}`,
        body: `Scheduled for ${todo.fromTime} - ${todo.untilTime}`,
        url: "/htbasas",
      });

      const results = await Promise.allSettled(
        subscriptions.map(async (sub) => {
          try {
            await webpush.sendNotification(
              { endpoint: sub.endpoint, keys: sub.keys },
              payload,
            );
          } catch (error: any) {
            if (error?.statusCode === 410 || error?.statusCode === 404) {
              await db
                .collection("push_subscriptions")
                .deleteOne({ endpoint: sub.endpoint });
            }
            throw error;
          }
        }),
      );

      const sent = results.filter((r) => r.status === "fulfilled").length;
      totalSent += sent;

      // Mark todo as notified for today so it doesn't fire again
      await db
        .collection("todos")
        .updateOne({ _id: todo._id }, { $set: { notifiedAt: dateStr } });
    }

    return NextResponse.json({
      success: true,
      todosNotified: todos.length,
      pushesSent: totalSent,
      checked: { dateStr, timeStr },
    });
  } catch (error) {
    console.error("Error in check-tasks cron:", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
