import mongoose from "mongoose";
import { connectMongoose } from "@/lib/db";
import { PersonModel } from "@/features/shared/models/person.model";
import type { Gender, Person, PersonEntryKind } from "../types";

interface RawMoment {
  text?: string;
  createdAt?: Date | string;
}

interface RawPerson {
  _id: unknown;
  name: string;
  gender: Gender;
  birthday?: Date | string | null;
  likes?: string[];
  hates?: string[];
  moments?: RawMoment[];
  linkedIds?: unknown[];
  createdAt: Date | string;
}

function asIso(value: Date | string | null | undefined) {
  if (value == null) return null;
  if (typeof value === "string") return value;
  return value.toISOString();
}

function asPerson(doc: RawPerson): Person {
  return {
    _id: String(doc._id),
    name: doc.name,
    gender: doc.gender,
    birthday: asIso(doc.birthday),
    likes: doc.likes ?? [],
    hates: doc.hates ?? [],
    moments: (doc.moments ?? []).map((moment) => ({
      text: moment.text ?? "",
      createdAt: asIso(moment.createdAt) ?? "",
    })),
    linkedIds: (doc.linkedIds ?? []).map((id) => String(id)),
    createdAt: asIso(doc.createdAt) ?? "",
  };
}

export async function listPeople(): Promise<Person[]> {
  await connectMongoose();
  const docs = await PersonModel.find().sort({ name: 1 }).lean();
  return docs.map((doc) => asPerson(doc as RawPerson));
}

export async function getPerson(id: string): Promise<Person | null> {
  await connectMongoose();
  if (!mongoose.isValidObjectId(id)) return null;
  const doc = await PersonModel.findById(id).lean();
  if (!doc) return null;
  return asPerson(doc as RawPerson);
}

export async function createPerson(input: {
  name: string;
  gender: Gender;
  birthday: Date | null;
}): Promise<Person> {
  await connectMongoose();
  const doc = await PersonModel.create(input);
  return asPerson(doc.toObject() as RawPerson);
}

export async function addPersonEntry(
  id: string,
  kind: PersonEntryKind,
  text: string,
): Promise<Person | null> {
  await connectMongoose();
  if (!mongoose.isValidObjectId(id)) return null;
  const update =
    kind === "like"
      ? { $push: { likes: text } }
      : kind === "hate"
        ? { $push: { hates: text } }
        : { $push: { moments: { text, createdAt: new Date() } } };
  const doc = await PersonModel.findByIdAndUpdate(id, update, { new: true }).lean();
  if (!doc) return null;
  return asPerson(doc as RawPerson);
}

export async function setPersonLinks(
  id: string,
  linkedIds: string[],
): Promise<Person | null> {
  await connectMongoose();
  if (!mongoose.isValidObjectId(id)) return null;
  const current = await PersonModel.findById(id).lean();
  if (!current) return null;

  const next = [...new Set(linkedIds.filter((linkId) => linkId !== id && mongoose.isValidObjectId(linkId)))];
  const prev = (current.linkedIds ?? []).map((linkId) => String(linkId));
  const self = new mongoose.Types.ObjectId(id);

  const removed = prev.filter((linkId) => !next.includes(linkId));
  const added = next.filter((linkId) => !prev.includes(linkId));

  if (removed.length > 0) {
    await PersonModel.updateMany(
      { _id: { $in: removed } },
      { $pull: { linkedIds: self } },
    );
  }
  if (added.length > 0) {
    await PersonModel.updateMany(
      { _id: { $in: added } },
      { $addToSet: { linkedIds: self } },
    );
  }

  const doc = await PersonModel.findByIdAndUpdate(
    id,
    { linkedIds: next.map((linkId) => new mongoose.Types.ObjectId(linkId)) },
    { new: true },
  ).lean();
  if (!doc) return null;
  return asPerson(doc as RawPerson);
}
