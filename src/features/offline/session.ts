import { offlineDb, type OfflineSession } from "./db";

const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

export async function writeSessionSnapshot(input: {
  userId: string;
  username: string;
}) {
  const username = input.username.trim() || "me";
  await offlineDb.session.put({
    id: "current",
    userId: input.userId,
    username,
    validUntil: Date.now() + SESSION_MS,
  });
}

export async function readValidSession(): Promise<OfflineSession | null> {
  const row = await offlineDb.session.get("current");
  if (!row || row.validUntil <= Date.now()) return null;
  return row;
}

export async function clearSessionSnapshot() {
  await offlineDb.session.delete("current");
}
