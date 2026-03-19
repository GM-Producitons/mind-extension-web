"use server";
import { getDB } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function getUserById(userId: string) {
  try {
    const db = await getDB();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return null;
    }

    const returnUser = JSON.parse(JSON.stringify(user));
    delete returnUser.password;

    return returnUser;
  } catch (error) {
    console.error("Error fetching user by id:", error);
    throw error;
  }
}
