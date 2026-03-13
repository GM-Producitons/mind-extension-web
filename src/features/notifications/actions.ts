"use server";
import { getDB } from "@/lib/db";
import webpush from "web-push";

let vapidInitialized = false;
function ensureVapid() {
  if (!vapidInitialized && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      "mailto:your-email@example.com",
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!,
    );
    vapidInitialized = true;
  }
}

export async function saveSubscription(subscription: any) {
  const db = await getDB();

  // Upsert by endpoint to avoid duplicate subscriptions
  await db
    .collection("pushSubscriptions")
    .updateOne(
      { endpoint: subscription.endpoint },
      { $set: subscription },
      { upsert: true },
    );
}

export async function sendPush(todo: { title: string; body?: string }) {
  ensureVapid();
  const db = await getDB();
  const subscriptions = await db
    .collection("pushSubscriptions")
    .find()
    .toArray();

  for (const sub of subscriptions) {
    await webpush.sendNotification(
      sub as any,
      JSON.stringify({
        title: todo.title,
        body: todo.body || "Task is starting now",
      }),
    );
  }
}
