"use server";
import { getDB } from "@/lib/db";
import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:your-email@example.com",
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function saveSubscription(subscription: any) {
  const db = await getDB();
  await db.collection("pushSubscriptions").insertOne(subscription);
}

export async function sendPush(todo: { title: string; body?: string }) {
  const db = await getDB();
  const subscriptions = await db
    .collection("pushSubscriptions")
    .find()
    .toArray();

  for (const sub of subscriptions) {
    await webpush.sendNotification(
      sub,
      JSON.stringify({
        title: todo.title,
        body: todo.body || "Task is starting now",
      }),
    );
  }
}
