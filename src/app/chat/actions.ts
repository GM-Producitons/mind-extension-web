"use server";

import { headers, cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth-utils";

export async function logChatAccess() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  const payload = token ? await verifyToken(token) : null;

  if (!payload) {
    console.error("[Chat Access] Could not identify the user opening chat");
    return;
  }

  const db = await getDB();
  const userQuery = ObjectId.isValid(payload.userId)
    ? { _id: new ObjectId(payload.userId) }
    : { email: payload.email };
  const user = await db.collection("users").findOne(userQuery);
  const requestHeaders = await headers();
  const userSnapshot = user ? { ...user } : null;

  if (userSnapshot && "password" in userSnapshot) {
    delete userSnapshot.password;
  }

  const logDocument = {
    event: "chat.opened",
    timestamp: new Date(),
    path: "/chat",
    userId: payload.userId,
    username: payload.username,
    email: payload.email,
    isMe: user?.isMe === true,
    isMaram: user?.isMaram === true,
    user: userSnapshot,
    request: {
      userAgent: requestHeaders.get("user-agent"),
      referer: requestHeaders.get("referer"),
      forwardedFor: requestHeaders.get("x-forwarded-for"),
      forwardedHost: requestHeaders.get("x-forwarded-host"),
      forwardedProto: requestHeaders.get("x-forwarded-proto"),
    },
  };

  await db.collection("logs").insertOne(logDocument);

  if (logDocument.isMe) {
    console.log(
      `[Chat Access] User with isMe=true opened chat: ${payload.username}`,
    );
  }

  if (logDocument.isMaram) {
    console.log(
      `[Chat Access] User with isMaram=true opened chat: ${payload.username}`,
    );
  }
}
