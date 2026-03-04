import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { getDB } from "@/lib/db";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT =
  process.env.VAPID_SUBJECT || "mailto:admin@mindextension.app";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export async function POST(request: NextRequest) {
  try {
    const { title, body, url } = await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: "title and body are required" },
        { status: 400 },
      );
    }

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      return NextResponse.json(
        { error: "VAPID keys not configured" },
        { status: 500 },
      );
    }

    const db = await getDB();
    const subscriptions = await db
      .collection("push_subscriptions")
      .find({})
      .toArray();

    const payload = JSON.stringify({ title, body, url: url || "/dashboard" });

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: sub.keys,
            },
            payload,
          );
        } catch (error: any) {
          // If subscription is expired/invalid (410 Gone or 404), remove it
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
    const failed = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({ success: true, sent, failed });
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 },
    );
  }
}
