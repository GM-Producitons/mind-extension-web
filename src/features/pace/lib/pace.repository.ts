import { connectMongoose } from "@/lib/db";
import { PaceBarModel } from "@/features/shared/models/pace-bar.model";
import { PaceEntryModel } from "@/features/shared/models/pace-entry.model";
import { PaceGroupModel } from "@/features/shared/models/pace-group.model";
import type {
  BarPatch,
  ExpectedRule,
  GroupPatch,
  PaceBarRecord,
  PaceEntryRecord,
  PaceGroupRecord,
  PaceKind,
  PaceSource,
  PaceVoidedBy,
} from "../types";

interface GroupDoc {
  _id: { toString(): string };
  slug: string;
  name: string;
  icon: string;
  unit: string;
  order: number;
  archived?: boolean;
  createdAt?: Date;
}

interface BarDoc {
  _id: { toString(): string };
  slug: string;
  name: string;
  icon: string;
  unit: string;
  groupId?: { toString(): string } | null;
  startDate: string;
  expectedRule: ExpectedRule;
  noteChips?: string[];
  order: number;
  archived?: boolean;
  createdAt?: Date;
}

interface EntryDoc {
  _id: { toString(): string };
  barId: { toString(): string };
  kind: PaceKind;
  amount: number;
  note: string;
  source: PaceSource;
  date: string;
  idempotencyKey?: string | null;
  createdAt?: Date;
  voidedAt?: Date | null;
  voidedBy?: PaceVoidedBy | null;
}

let readyPromise: Promise<void> | null = null;

async function ready() {
  await connectMongoose();
  if (readyPromise) return readyPromise;
  readyPromise = Promise.all([
    PaceGroupModel.createIndexes(),
    PaceBarModel.createIndexes(),
    PaceEntryModel.createIndexes(),
  ])
    .then(() => undefined)
    .catch((error: unknown) => {
      readyPromise = null;
      throw error;
    });
  return readyPromise;
}

export function isDuplicateKey(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  if ("code" in error && error.code === 11000) return true;
  if ("cause" in error) return isDuplicateKey(error.cause);
  return false;
}

function activeFilter(activeOnly: boolean) {
  return activeOnly ? { archived: { $ne: true } } : {};
}

function keyFilter(key: string) {
  if (/^[a-f0-9]{24}$/i.test(key)) return { $or: [{ slug: key }, { _id: key }] };
  return { slug: key };
}

function mapGroup(doc: GroupDoc): PaceGroupRecord {
  return {
    id: doc._id.toString(),
    slug: doc.slug,
    name: doc.name,
    icon: doc.icon,
    unit: doc.unit,
    order: doc.order,
    archived: doc.archived === true,
    createdAt: doc.createdAt ?? new Date(),
  };
}

function mapBar(doc: BarDoc): PaceBarRecord {
  return {
    id: doc._id.toString(),
    slug: doc.slug,
    name: doc.name,
    icon: doc.icon,
    unit: doc.unit,
    groupId: doc.groupId ? doc.groupId.toString() : null,
    startDate: doc.startDate,
    expectedRule: doc.expectedRule,
    noteChips: doc.noteChips ?? [],
    order: doc.order,
    archived: doc.archived === true,
    createdAt: doc.createdAt ?? new Date(),
  };
}

function mapEntry(doc: EntryDoc): PaceEntryRecord {
  return {
    id: doc._id.toString(),
    barId: doc.barId.toString(),
    kind: doc.kind,
    amount: doc.amount,
    note: doc.note,
    source: doc.source,
    date: doc.date,
    idempotencyKey: doc.idempotencyKey ?? null,
    createdAt: doc.createdAt ?? new Date(),
    voidedAt: doc.voidedAt ?? null,
    voidedBy: doc.voidedBy ?? null,
  };
}

export async function listGroups(activeOnly: boolean): Promise<PaceGroupRecord[]> {
  await ready();
  const docs = await PaceGroupModel.find(activeFilter(activeOnly)).lean<GroupDoc[]>();
  return docs.map(mapGroup);
}

export async function listBars(activeOnly: boolean): Promise<PaceBarRecord[]> {
  await ready();
  const docs = await PaceBarModel.find(activeFilter(activeOnly)).lean<BarDoc[]>();
  return docs.map(mapBar);
}

export async function listBarsInGroup(
  groupId: string,
  activeOnly: boolean,
): Promise<PaceBarRecord[]> {
  await ready();
  const docs = await PaceBarModel.find({
    groupId,
    ...activeFilter(activeOnly),
  }).lean<BarDoc[]>();
  return docs.map(mapBar);
}

export async function countBarsInGroup(groupId: string): Promise<number> {
  await ready();
  return PaceBarModel.countDocuments({ groupId });
}

export async function findGroup(key: string): Promise<PaceGroupRecord | null> {
  await ready();
  const doc = await PaceGroupModel.findOne(keyFilter(key)).lean<GroupDoc | null>();
  return doc ? mapGroup(doc) : null;
}

export async function findGroupById(id: string): Promise<PaceGroupRecord | null> {
  await ready();
  const doc = await PaceGroupModel.findById(id).lean<GroupDoc | null>();
  return doc ? mapGroup(doc) : null;
}

export async function findBar(key: string): Promise<PaceBarRecord | null> {
  await ready();
  const doc = await PaceBarModel.findOne(keyFilter(key)).lean<BarDoc | null>();
  return doc ? mapBar(doc) : null;
}

export async function slugTaken(slug: string): Promise<boolean> {
  await ready();
  const [group, bar] = await Promise.all([
    PaceGroupModel.exists({ slug }),
    PaceBarModel.exists({ slug }),
  ]);
  return Boolean(group || bar);
}

export async function nextOrder(kind: "group" | "bar"): Promise<number> {
  await ready();
  const last =
    kind === "group"
      ? await PaceGroupModel.findOne().sort({ order: -1 }).select("order").lean<{ order?: number } | null>()
      : await PaceBarModel.findOne().sort({ order: -1 }).select("order").lean<{ order?: number } | null>();
  return (last?.order ?? -1) + 1;
}

export async function insertGroup(input: {
  slug: string;
  name: string;
  icon: string;
  unit: string;
  order: number;
}): Promise<PaceGroupRecord> {
  await ready();
  const doc = await PaceGroupModel.create(input);
  return mapGroup(doc);
}

export async function insertBar(input: {
  slug: string;
  name: string;
  icon: string;
  unit: string;
  groupId: string | null;
  startDate: string;
  expectedRule: ExpectedRule;
  noteChips: string[];
  order: number;
}): Promise<PaceBarRecord> {
  await ready();
  const doc = await PaceBarModel.create(input);
  return mapBar(doc.toObject() as BarDoc);
}

export async function updateGroup(id: string, patch: GroupPatch): Promise<void> {
  await ready();
  await PaceGroupModel.updateOne({ _id: id }, { $set: patch });
}

export async function updateBar(id: string, patch: BarPatch): Promise<void> {
  await ready();
  await PaceBarModel.updateOne({ _id: id }, { $set: patch });
}

export async function listOpenEntries(barIds: string[]): Promise<PaceEntryRecord[]> {
  await ready();
  if (barIds.length === 0) return [];
  const docs = await PaceEntryModel.find({
    barId: { $in: barIds },
    voidedAt: null,
  }).lean<EntryDoc[]>();
  return docs.map(mapEntry);
}

export async function listHistory(
  barId: string,
  query: { from?: string; to?: string; limit: number },
): Promise<{ entries: PaceEntryRecord[]; total: number }> {
  await ready();
  const filter: Record<string, unknown> = { barId };
  if (query.from || query.to) {
    const date: Record<string, string> = {};
    if (query.from) date.$gte = query.from;
    if (query.to) date.$lte = query.to;
    filter.date = date;
  }
  const [docs, total] = await Promise.all([
    PaceEntryModel.find(filter).sort({ createdAt: -1 }).limit(query.limit).lean<EntryDoc[]>(),
    PaceEntryModel.countDocuments(filter),
  ]);
  return { entries: docs.map(mapEntry), total };
}

export async function findEntryById(id: string): Promise<PaceEntryRecord | null> {
  await ready();
  if (!/^[a-f0-9]{24}$/i.test(id)) return null;
  const doc = await PaceEntryModel.findById(id).lean<EntryDoc | null>();
  return doc ? mapEntry(doc) : null;
}

export async function findEntryByKey(key: string): Promise<PaceEntryRecord | null> {
  await ready();
  const doc = await PaceEntryModel.findOne({ idempotencyKey: key }).lean<EntryDoc | null>();
  return doc ? mapEntry(doc) : null;
}

export async function insertEntry(input: {
  barId: string;
  kind: PaceKind;
  amount: number;
  note: string;
  source: PaceSource;
  date: string;
  idempotencyKey?: string;
}): Promise<PaceEntryRecord> {
  await ready();
  const doc = await PaceEntryModel.create({
    barId: input.barId,
    kind: input.kind,
    amount: input.amount,
    note: input.note,
    source: input.source,
    date: input.date,
    voidedAt: null,
    ...(input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : {}),
  });
  return mapEntry(doc);
}

export async function voidEntry(id: string, voidedBy: PaceVoidedBy): Promise<boolean> {
  await ready();
  const result = await PaceEntryModel.updateOne(
    { _id: id, voidedAt: null },
    { $set: { voidedAt: new Date(), voidedBy } },
  );
  return result.modifiedCount === 1;
}
