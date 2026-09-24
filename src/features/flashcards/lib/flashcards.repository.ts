import { connectMongoose } from "@/lib/db";
import { FlashcardClusterModel } from "@/features/shared/models/flashcard-cluster.model";
import { FlashcardModel } from "@/features/shared/models/flashcard.model";
import type {
  ClusterRecord,
  Flashcard,
  FlashcardClusterRef,
  Grade,
} from "../types";

interface ClusterStatsRow {
  clusterId: string;
  cardCount: number;
  knewCount: number;
  missedCount: number;
}

interface RawClusterRef {
  _id?: unknown;
  name?: unknown;
}

interface RawFlashcard {
  _id: unknown;
  clue: string;
  hidden: string;
  clusterIds?: Array<string | RawClusterRef | null>;
  lastResult?: Grade | null;
  lastTrainedAt?: Date | string | null;
  knewCount?: number;
  missedCount?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

function toPlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function asIso(value: Date | string | null | undefined) {
  if (value == null) return null;
  if (typeof value === "string") return value;
  return value.toISOString();
}

function asCluster(doc: {
  _id: unknown;
  name: string;
  lastTrainedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}): ClusterRecord {
  return {
    _id: String(doc._id),
    name: doc.name,
    lastTrainedAt: asIso(doc.lastTrainedAt),
    createdAt: asIso(doc.createdAt) ?? "",
    updatedAt: asIso(doc.updatedAt) ?? "",
  };
}

function asClusterRef(entry: string | RawClusterRef): FlashcardClusterRef | null {
  if (typeof entry === "string") {
    return { _id: entry, name: "" };
  }
  if (!entry || entry._id == null) return null;
  return {
    _id: String(entry._id),
    name: typeof entry.name === "string" ? entry.name : "",
  };
}

function asFlashcard(doc: RawFlashcard): Flashcard {
  const refs = (doc.clusterIds ?? [])
    .filter((entry): entry is string | RawClusterRef => entry != null)
    .map(asClusterRef)
    .filter((entry): entry is FlashcardClusterRef => entry != null);

  return {
    _id: String(doc._id),
    clue: doc.clue,
    hidden: doc.hidden,
    clusterIds: refs.map((entry) => entry._id),
    clusters: refs.filter((entry) => entry.name.length > 0),
    lastResult:
      doc.lastResult === "knew" || doc.lastResult === "missed"
        ? doc.lastResult
        : null,
    lastTrainedAt: asIso(doc.lastTrainedAt),
    knewCount: doc.knewCount ?? 0,
    missedCount: doc.missedCount ?? 0,
    createdAt: asIso(doc.createdAt) ?? "",
    updatedAt: asIso(doc.updatedAt) ?? "",
  };
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function createClusterRecord(name: string) {
  await connectMongoose();
  const doc = await FlashcardClusterModel.create({
    name,
    lastTrainedAt: null,
  });
  return asCluster(toPlain(doc.toObject()));
}

export async function listClusterRecords() {
  await connectMongoose();
  const docs = await FlashcardClusterModel.find().sort({ createdAt: -1 }).lean();
  return toPlain(docs).map(asCluster);
}

export async function getClusterRecord(id: string) {
  await connectMongoose();
  const doc = await FlashcardClusterModel.findById(id).lean();
  if (!doc) return null;
  return asCluster(toPlain(doc));
}

export async function getClusterRecordsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  await connectMongoose();
  const docs = await FlashcardClusterModel.find({ _id: { $in: ids } }).lean();
  return toPlain(docs).map(asCluster);
}

export async function findClusterRecordByName(name: string) {
  await connectMongoose();
  const doc = await FlashcardClusterModel.findOne({
    name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
  }).lean();
  if (!doc) return null;
  return asCluster(toPlain(doc));
}

export async function renameClusterRecord(id: string, name: string) {
  await connectMongoose();
  const doc = await FlashcardClusterModel.findByIdAndUpdate(
    id,
    { name },
    { returnDocument: "after" },
  ).lean();
  if (!doc) return null;
  return asCluster(toPlain(doc));
}

export async function deleteClusterRecord(id: string) {
  await connectMongoose();
  const doc = await FlashcardClusterModel.findByIdAndDelete(id).lean();
  return doc != null;
}

export async function pullClusterFromCards(clusterId: string) {
  await connectMongoose();
  await FlashcardModel.updateMany(
    { clusterIds: clusterId },
    { $pull: { clusterIds: clusterId } },
  );
}

export async function deleteCardsWithoutClusters() {
  await connectMongoose();
  await FlashcardModel.deleteMany({ clusterIds: { $size: 0 } });
}

export async function touchClustersTrained(ids: string[], at: Date) {
  if (ids.length === 0) return;
  await connectMongoose();
  await FlashcardClusterModel.updateMany(
    { _id: { $in: ids } },
    { $set: { lastTrainedAt: at } },
  );
}

export async function getClusterStats(): Promise<ClusterStatsRow[]> {
  await connectMongoose();
  const rows = await FlashcardModel.aggregate<{
    _id: unknown;
    cardCount: number;
    knewCount: number;
    missedCount: number;
  }>([
    { $unwind: "$clusterIds" },
    {
      $group: {
        _id: "$clusterIds",
        cardCount: { $sum: 1 },
        knewCount: {
          $sum: { $cond: [{ $eq: ["$lastResult", "knew"] }, 1, 0] },
        },
        missedCount: {
          $sum: { $cond: [{ $eq: ["$lastResult", "missed"] }, 1, 0] },
        },
      },
    },
  ]);

  return rows.map((row) => ({
    clusterId: String(row._id),
    cardCount: row.cardCount,
    knewCount: row.knewCount,
    missedCount: row.missedCount,
  }));
}

export async function createFlashcardRecord(input: {
  clue: string;
  hidden: string;
  clusterIds: string[];
}) {
  await connectMongoose();
  const doc = await FlashcardModel.create({
    clue: input.clue,
    hidden: input.hidden,
    clusterIds: input.clusterIds,
    lastResult: null,
    lastTrainedAt: null,
    knewCount: 0,
    missedCount: 0,
  });
  return asFlashcard(toPlain(doc.toObject()));
}

export async function listFlashcardRecords(clusterId?: string) {
  await connectMongoose();
  const filter = clusterId ? { clusterIds: clusterId } : {};
  const docs = await FlashcardModel.find(filter)
    .populate({ path: "clusterIds", select: "name" })
    .lean();
  return toPlain(docs).map(asFlashcard);
}

export async function gradeFlashcardRecord(
  id: string,
  result: Grade,
  at: Date,
) {
  await connectMongoose();
  const doc = await FlashcardModel.findByIdAndUpdate(
    id,
    {
      $inc: result === "knew" ? { knewCount: 1 } : { missedCount: 1 },
      $set: { lastResult: result, lastTrainedAt: at },
    },
    { returnDocument: "after" },
  )
    .populate({ path: "clusterIds", select: "name" })
    .lean();
  if (!doc) return null;
  return asFlashcard(toPlain(doc));
}
