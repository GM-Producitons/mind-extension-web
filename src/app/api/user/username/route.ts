// app/api/ably/auth/route.ts
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth-utils";

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

  return Response.json({ username });
}
