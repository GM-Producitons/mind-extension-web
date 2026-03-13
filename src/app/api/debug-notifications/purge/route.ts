import { getDB } from "@/lib/db";
import { NextResponse } from "next/server";

// Remove subscriptions that are missing endpoint or keys
export async function POST() {
  try {
    const db = await getDB();

    const result = await db.collection("pushSubscriptions").deleteMany({
      $or: [
        { endpoint: { $exists: false } },
        { "keys.p256dh": { $exists: false } },
        { "keys.auth": { $exists: false } },
      ],
    });

    const remaining = await db.collection("pushSubscriptions").countDocuments();

    return NextResponse.json({
      deleted: result.deletedCount,
      remaining,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
