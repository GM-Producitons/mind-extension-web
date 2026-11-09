import {
  addCairoDays,
  buildWorkChart,
} from "../lib/activity-chart";
import {
  cairoDayStart,
  formatStatusLine,
  summarizeDay,
  toStatusJson,
  type ActivityStatusJson,
} from "../lib/activity-time";
import type { ActivityState } from "../lib/activity-states";
import {
  closeOpenSession,
  findLatestEndedAt,
  findOpenSession,
  findSessionsOverlapping,
  insertOpenSession,
} from "../lib/activity.repository";

async function daySummary(now: Date) {
  const dayStart = cairoDayStart(now);
  const [sessions, lastEndedAt] = await Promise.all([
    findSessionsOverlapping(dayStart, now),
    findLatestEndedAt(),
  ]);
  return summarizeDay(sessions, lastEndedAt, now);
}

export async function getActivityStatus(now = new Date()): Promise<string> {
  return formatStatusLine(await daySummary(now));
}

export async function getActivityStatusJson(
  now = new Date(),
): Promise<ActivityStatusJson> {
  return toStatusJson(await daySummary(now));
}

export async function switchActivity(
  requestedState: ActivityState,
  now = new Date(),
): Promise<string> {
  if (requestedState !== "free") {
    const open = await findOpenSession();
    if (open?.state === requestedState) {
      return formatStatusLine(await daySummary(now));
    }
  }

  const closed = await closeOpenSession(now);
  const started =
    requestedState === "free"
      ? false
      : await insertOpenSession(now, requestedState);
  const changed = closed !== null || started;

  if (changed) {
    // TODO: publish new state to Ably
  }

  return formatStatusLine(await daySummary(now));
}

export async function getWorkChart(now = new Date()) {
  const rangeStart = addCairoDays(cairoDayStart(now), -27);
  const sessions = await findSessionsOverlapping(rangeStart, now);
  return { success: true as const, data: buildWorkChart(sessions, now) };
}

export async function getActivityDashboard(now = new Date()) {
  const rangeStart = addCairoDays(cairoDayStart(now), -27);
  const dayStart = cairoDayStart(now);
  const [rangeSessions, todaySessions, lastEndedAt] = await Promise.all([
    findSessionsOverlapping(rangeStart, now),
    findSessionsOverlapping(dayStart, now),
    findLatestEndedAt(),
  ]);
  return {
    success: true as const,
    data: {
      status: toStatusJson(
        summarizeDay(todaySessions, lastEndedAt, now),
      ),
      chart: buildWorkChart(rangeSessions, now),
    },
  };
}
