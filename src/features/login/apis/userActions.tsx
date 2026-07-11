"use server";
import { cookies } from "next/headers";
import { getDB } from "@/lib/db";
import { createHash, compareHash } from "@/lib/auth-utils";
import { generateToken } from "@/lib/auth-utils";

// One-time helper to create yourself in the DB
// export async function createOneUser(pass: string) {
//     try {
//         const db = await getDB();
//         const hashedPass = await createHash(pass);
//         const userInserted = await db.collection("users").insertOne({
//             email: "gogo05tv@gmail.com",
//             name: "GM",
//             password: hashedPass,
//             isMe: true,
//         });
//         return { success: true, user: JSON.parse(JSON.stringify(userInserted)) };
//     } catch (error) {
//         console.error("Error adding user:", error);
//         return { success: false, error: "Failed to add user" };
//     }
// }

// Login: verify password → create JWT → set httpOnly cookie
export async function loginUser(email: string, password: string) {
  try {
    const db = await getDB();
    const user = await db.collection("users").findOne({ email: email });

    if (!user) {
      console.log("didn't find the user");
      return { success: false, error: "عيب" };
    }

    const isPasswordValid = await compareHash(password, user.password);
    if (!isPasswordValid) {
      console.log("password didn't match tha hash");
      return { success: false, error: "عيب" };
    }

    const token = await generateToken({
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
    });

    // Set httpOnly cookie server-side — can't be read/stolen by JS
    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    const returnUser = JSON.parse(JSON.stringify(user));
    delete returnUser.password;

    return { success: true, user: returnUser };
  } catch (error) {
    console.error("Error logging in:", error);
    return { success: false, error: "Login failed" };
  }
}

// Logout: delete the cookie
export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("auth-token");
  console.log("user logged out!");
  return { success: true };
}
