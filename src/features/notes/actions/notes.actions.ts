"use server";

import { z } from "zod";
import {
  createFolderService,
  createNoteService,
  deleteFolderService,
  deleteNoteService,
  listVaultService,
  renameFolderService,
  updateNoteService,
} from "../services/notes.service";
import type { ActionResult, Note, NoteFolder, VaultSnapshot } from "../types";

const CreateFolderSchema = z.object({
  name: z.string().min(1).max(120),
  parentId: z.string().nullable().optional(),
});

const RenameFolderSchema = z.object({
  name: z.string().min(1).max(120),
});

const CreateNoteSchema = z.object({
  folderId: z.string().nullable().optional(),
});

const UpdateNoteSchema = z.object({
  title: z.string().max(500).optional(),
  markdown: z.string().optional(),
  folderId: z.string().nullable().optional(),
});

async function run<T>(
  work: () => Promise<ActionResult<T>>,
  fallback: string,
): Promise<ActionResult<T>> {
  try {
    return await work();
  } catch (error) {
    console.error(fallback, error);
    return { success: false, error: fallback };
  }
}

export async function listVaultAction(): Promise<ActionResult<VaultSnapshot>> {
  return run(listVaultService, "Could not load notes");
}

export async function createFolderAction(
  raw: Record<string, unknown>,
): Promise<ActionResult<NoteFolder>> {
  const parsed = CreateFolderSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((e) => e.message).join(", "),
    };
  }
  return run(() => createFolderService(parsed.data), "Could not create folder");
}

export async function renameFolderAction(
  id: string,
  raw: Record<string, unknown>,
): Promise<ActionResult<NoteFolder>> {
  if (!id) return { success: false, error: "ID is required" };
  const parsed = RenameFolderSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((e) => e.message).join(", "),
    };
  }
  return run(
    () => renameFolderService(id, parsed.data.name),
    "Could not rename folder",
  );
}

export async function deleteFolderAction(
  id: string,
): Promise<ActionResult<void>> {
  if (!id) return { success: false, error: "ID is required" };
  return run(() => deleteFolderService(id), "Could not delete folder");
}

export async function createNoteAction(
  raw: Record<string, unknown>,
): Promise<ActionResult<Note>> {
  const parsed = CreateNoteSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((e) => e.message).join(", "),
    };
  }
  return run(
    () => createNoteService(parsed.data.folderId ?? null),
    "Could not create note",
  );
}

export async function updateNoteAction(
  id: string,
  raw: Record<string, unknown>,
): Promise<ActionResult<Note>> {
  if (!id) return { success: false, error: "ID is required" };
  const parsed = UpdateNoteSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((e) => e.message).join(", "),
    };
  }
  return run(() => updateNoteService(id, parsed.data), "Could not save note");
}

export async function deleteNoteAction(id: string): Promise<ActionResult<void>> {
  if (!id) return { success: false, error: "ID is required" };
  return run(() => deleteNoteService(id), "Could not delete note");
}
