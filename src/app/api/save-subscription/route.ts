import { getDB } from "@/lib/db";

export async function POST(req: Request) {
  const subscription = await req.json();

  const db = await getDB();

  // Upsert by endpoint to avoid duplicates
  await db
    .collection("pushSubscriptions")
    .updateOne(
      { endpoint: subscription.endpoint },
      { $set: subscription },
      { upsert: true },
    );

  return Response.json({ success: true });
}
