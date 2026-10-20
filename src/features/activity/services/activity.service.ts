import {
  cairoDayStart,
  formatStatusLine,
  summarizeDay,
} from "../lib/activity-time";
import {
  claimNudge,
  closeOpenSession,
  findLatestEndedAt,
  findSessionsOverlapping,
  insertOpenSession,
} from "../lib/activity.repository";

async function statusLine(now: Date): Promise<string> {
  const dayStart = cairoDayStart(now);
  const [sessions, lastEndedAt] = await Promise.all([
    findSessionsOverlapping(dayStart, now),
    findLatestEndedAt(),
  ]);
  return formatStatusLine(summarizeDay(sessions, lastEndedAt, now));
}

export async function getActivityStatus(now = new Date()): Promise<string> {
  return statusLine(now);
}

export async function toggleActivity(now = new Date()): Promise<string> {
  const closed = await closeOpenSession(now);
  const started = closed ? false : await insertOpenSession(now);
  const flipped = closed !== null || started;

  if (flipped) {
    // TODO: publish new state to Ably
  }

  return statusLine(now);
}

export async function takeActivityNudge(now = new Date()): Promise<"yes" | "no"> {
  const claimed = await claimNudge(now);
  return claimed ? "yes" : "no";
}
