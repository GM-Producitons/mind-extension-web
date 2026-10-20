import { connectMongoose } from "@/lib/db";
import { ActivitySessionModel } from "@/features/shared/models/activity-session.model";
import {
  NUDGE_INTERVAL_MS,
  type ActivitySessionSpan,
} from "./activity-time";

interface SessionDoc {
  startedAt: Date;
  endedAt?: Date | null;
  lastNudgedAt?: Date | null;
}

function asSpan(doc: SessionDoc): ActivitySessionSpan {
  return {
    startedAt: new Date(doc.startedAt),
    endedAt: doc.endedAt == null ? null : new Date(doc.endedAt),
    lastNudgedAt: doc.lastNudgedAt == null ? null : new Date(doc.lastNudgedAt),
  };
}

let indexesReady: Promise<void> | null = null;

async function ready() {
  await connectMongoose();
  if (indexesReady) return indexesReady;
  indexesReady = ActivitySessionModel.createIndexes()
    .then(() => undefined)
    .catch((error: unknown) => {
      indexesReady = null;
      throw error;
    });
  return indexesReady;
}

function isDuplicateKey(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  if ("code" in error && error.code === 11000) return true;
  if ("cause" in error) return isDuplicateKey(error.cause);
  return false;
}

export async function findSessionsOverlapping(
  windowStart: Date,
  windowEnd: Date,
): Promise<ActivitySessionSpan[]> {
  await ready();
  const docs = await ActivitySessionModel.find({
    startedAt: { $lte: windowEnd },
    $or: [{ endedAt: null }, { endedAt: { $gt: windowStart } }],
  }).lean();
  return docs.map((doc) => asSpan(doc));
}

export async function findLatestEndedAt(): Promise<Date | null> {
  await ready();
  const doc = await ActivitySessionModel.findOne({ endedAt: { $ne: null } })
    .sort({ endedAt: -1 })
    .select({ endedAt: 1 })
    .lean();
  if (!doc?.endedAt) return null;
  return new Date(doc.endedAt);
}

export async function closeOpenSession(
  now: Date,
): Promise<ActivitySessionSpan | null> {
  await ready();
  const doc = await ActivitySessionModel.findOneAndUpdate(
    { open: true, endedAt: null },
    { $set: { endedAt: now, open: false } },
  ).lean();
  if (!doc) return null;
  return asSpan(doc);
}

export async function insertOpenSession(now: Date): Promise<boolean> {
  await ready();
  try {
    await ActivitySessionModel.create({
      startedAt: now,
      endedAt: null,
      lastNudgedAt: null,
      open: true,
    });
    return true;
  } catch (error) {
    if (isDuplicateKey(error)) return false;
    throw error;
  }
}

/** Same rule as isNudgeDue: one open session, at most one claim per hour. */
export async function claimNudge(now: Date): Promise<boolean> {
  await ready();
  const dueAt = new Date(now.getTime() - NUDGE_INTERVAL_MS);
  const doc = await ActivitySessionModel.findOneAndUpdate(
    {
      open: true,
      endedAt: null,
      $or: [
        { lastNudgedAt: null, startedAt: { $lte: dueAt } },
        { lastNudgedAt: { $lte: dueAt } },
      ],
    },
    { $set: { lastNudgedAt: now } },
  ).lean();
  return doc !== null;
}
