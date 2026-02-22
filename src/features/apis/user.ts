"use server";
import { getDB } from "@/lib/db";

export async function getMe() {
  try {
    const db = await getDB();
    const user = await db.collection("users").findOne({ isMe: true });
    if (!user) {
      throw new Error("User not found");
    }
    const returndedUser = JSON.parse(JSON.stringify(user));
    return returndedUser;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}
