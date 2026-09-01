// app/api/ably/auth/route.ts
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth-utils";
import { getDB } from "@/lib/db";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    return Response.json({ error: "No token" }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload?.username) {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }

  const username = payload.username;

  // Fetch user document to get isMe and isMaram flags
  try {
    const db = await getDB();
    const user = await db.collection("users").findOne({ username });

    return Response.json({
      username,
      isMe: user?.isMe || false,
      isMaram: user?.isMaram || false,
    });
  } catch (error) {
    console.error("Error fetching user flags:", error);
    return Response.json({
      username,
      isMe: false,
      isMaram: false,
    });
  }
}
