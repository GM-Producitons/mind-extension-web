import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";
import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:your-email@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

// GET: Show debug info about subscriptions and todos
export async function GET() {
  try {
    const db = await getDB();

    const subscriptions = await db
      .collection("pushSubscriptions")
      .find()
      .toArray();

    const todos = await db
      .collection("todos")
      .find({ completed: false })
      .toArray();

    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    return NextResponse.json({
      step1_collections: collectionNames,
      step2_hasPushSubscriptionsCollection:
        collectionNames.includes("pushSubscriptions"),
      step3_subscriptionCount: subscriptions.length,
      step4_subscriptions: subscriptions.map((s) => ({
        _id: s._id,
        hasEndpoint: !!s.endpoint,
        endpoint: s.endpoint ? s.endpoint.substring(0, 60) + "..." : "MISSING",
        hasKeys: !!s.keys,
        hasP256dh: !!s.keys?.p256dh,
        hasAuth: !!s.keys?.auth,
        allFields: Object.keys(s),
      })),
      step5_incompleteTodoCount: todos.length,
      step6_todosWithTime: todos
        .filter((t) => t.fromTime && t.date)
        .map((t) => ({
          title: t.title,
          date: t.date,
          fromTime: t.fromTime,
        })),
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// POST: Test sending a push notification to all subscriptions
export async function POST(req: Request) {
  try {
    const db = await getDB();
    const subscriptions = await db
      .collection("pushSubscriptions")
      .find()
      .toArray();

    if (subscriptions.length === 0) {
      return NextResponse.json({
        error: "No subscriptions found in DB",
        hint: "Visit the test page and click 'Register & Save Subscription' first",
      });
    }

    const results = [];
    for (const sub of subscriptions) {
      if (!sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
        results.push({
          _id: sub._id,
          status: "SKIPPED - invalid subscription (missing endpoint/keys)",
          fields: Object.keys(sub),
        });
        continue;
      }

      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
          },
          JSON.stringify({
            title: "Debug Test Notification",
            body: "If you see this, push notifications work!",
          }),
        );
        results.push({ _id: sub._id, status: "SUCCESS" });
      } catch (err: any) {
        results.push({
          _id: sub._id,
          status: "FAILED",
          error: err.message,
          statusCode: err.statusCode,
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
