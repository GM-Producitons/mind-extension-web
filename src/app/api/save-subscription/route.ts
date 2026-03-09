import { getDB } from "@/lib/db";

export async function POST(req: Request) {
  const subscription = await req.json();

  const db = await getDB();
  await db.collection("pushSubscriptions").insertOne(subscription);

  return Response.json({ success: true });
}
