"use server";
import { getDB } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth-utils";
import { ObjectId } from "mongodb";

async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  return payload?.userId || null;
}

export async function saveDesktopTokenAction(token: string) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) throw new Error("Not authenticated");

    const db = await getDB();
    await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(userId) },
        { $addToSet: { client_tokens: token } as unknown as Document },
      );
    return { success: true };
  } catch (error) {
    console.error("Error saving desktop token:", error);
    return { success: false, error: "Failed to save desktop token" };
  }
}

export async function savePhoneTokenAction(token: string) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) throw new Error("Not authenticated");

    const db = await getDB();
    await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(userId) },
        { $addToSet: { phone_tokens: token } as unknown as Document },
      );
    return { success: true };
  } catch (error) {
    console.error("Error saving phone token:", error);
    return { success: false, error: "Failed to save phone token" };
  }
}
