import { connectMongoose } from "@/lib/db";
import { NoteFolderModel } from "@/features/shared/models/note-folder.model";
import { NoteModel } from "@/features/shared/models/note.model";
import type { CreateFolderInput, Note, NoteFolder, UpdateNoteInput } from "../types";

function toFolder(doc: Record<string, unknown>): NoteFolder {
  return {
    _id: String(doc._id),
    userId: String(doc.userId),
    parentId: doc.parentId ? String(doc.parentId) : null,
    name: String(doc.name ?? "Folder"),
    createdAt: new Date(doc.createdAt as string | Date),
    updatedAt: new Date(doc.updatedAt as string | Date),
  };
}

function toNote(doc: Record<string, unknown>): Note {
  return {
    _id: String(doc._id),
    userId: String(doc.userId),
    folderId: doc.folderId ? String(doc.folderId) : null,
    title: String(doc.title ?? "Untitled"),
    markdown: String(doc.markdown ?? ""),
    createdAt: new Date(doc.createdAt as string | Date),
    updatedAt: new Date(doc.updatedAt as string | Date),
  };
}

export async function listVaultRecords(userId: string) {
  await connectMongoose();
  const [folders, notes] = await Promise.all([
    NoteFolderModel.find({ userId }).sort({ name: 1 }).lean(),
    NoteModel.find({ userId }).sort({ updatedAt: -1 }).lean(),
  ]);
  return {
    folders: folders.map((f) =>
      toFolder(JSON.parse(JSON.stringify(f)) as Record<string, unknown>),
    ),
    notes: notes.map((n) =>
      toNote(JSON.parse(JSON.stringify(n)) as Record<string, unknown>),
    ),
  };
}

export async function createFolderRecord(
  userId: string,
  data: CreateFolderInput,
) {
  await connectMongoose();
  const doc = await NoteFolderModel.create({
    userId,
    name: data.name,
    parentId: data.parentId ?? null,
  });
  return toFolder(
    JSON.parse(JSON.stringify(doc.toObject())) as Record<string, unknown>,
  );
}

export async function renameFolderRecord(
  userId: string,
  id: string,
  name: string,
) {
  await connectMongoose();
  const doc = await NoteFolderModel.findOneAndUpdate(
    { _id: id, userId },
    { name },
    { new: true },
  ).lean();
  if (!doc) return null;
  return toFolder(JSON.parse(JSON.stringify(doc)) as Record<string, unknown>);
}

export async function deleteFolderRecord(userId: string, id: string) {
  await connectMongoose();
  const result = await NoteFolderModel.deleteOne({ _id: id, userId });
  return result.deletedCount > 0;
}

export async function countFolderChildren(userId: string, folderId: string) {
  await connectMongoose();
  const [childFolders, childNotes] = await Promise.all([
    NoteFolderModel.countDocuments({ userId, parentId: folderId }),
    NoteModel.countDocuments({ userId, folderId }),
  ]);
  return childFolders + childNotes;
}

export async function folderBelongsToUser(userId: string, folderId: string) {
  await connectMongoose();
  const doc = await NoteFolderModel.findOne({ _id: folderId, userId }).lean();
  return Boolean(doc);
}

export async function createNoteRecord(
  userId: string,
  folderId: string | null,
) {
  await connectMongoose();
  const doc = await NoteModel.create({
    userId,
    folderId,
    title: "Untitled",
    markdown: "",
  });
  return toNote(
    JSON.parse(JSON.stringify(doc.toObject())) as Record<string, unknown>,
  );
}

export async function updateNoteRecord(
  userId: string,
  id: string,
  patch: UpdateNoteInput,
) {
  await connectMongoose();
  const doc = await NoteModel.findOneAndUpdate({ _id: id, userId }, patch, {
    new: true,
  }).lean();
  if (!doc) return null;
  return toNote(JSON.parse(JSON.stringify(doc)) as Record<string, unknown>);
}

export async function deleteNoteRecord(userId: string, id: string) {
  await connectMongoose();
  const result = await NoteModel.deleteOne({ _id: id, userId });
  return result.deletedCount > 0;
}
