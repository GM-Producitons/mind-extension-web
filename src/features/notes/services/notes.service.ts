import { getSessionUser } from "@/lib/session";
import {
  countFolderChildren,
  createFolderRecord,
  createNoteRecord,
  deleteFolderRecord,
  deleteNoteRecord,
  folderBelongsToUser,
  listVaultRecords,
  renameFolderRecord,
  updateNoteRecord,
} from "../lib/notes.repository";
import type {
  ActionResult,
  CreateFolderInput,
  Note,
  NoteFolder,
  UpdateNoteInput,
  VaultSnapshot,
} from "../types";

async function requireUserId(): Promise<ActionResult<string>> {
  const session = await getSessionUser();
  if (!session?.userId) {
    return { success: false, error: "Not signed in" };
  }
  return { success: true, data: session.userId };
}

export async function listVaultService(): Promise<ActionResult<VaultSnapshot>> {
  const user = await requireUserId();
  if (!user.success) return user;
  const data = await listVaultRecords(user.data);
  return { success: true, data };
}

export async function createFolderService(
  input: CreateFolderInput,
): Promise<ActionResult<NoteFolder>> {
  const user = await requireUserId();
  if (!user.success) return user;

  if (input.parentId) {
    const valid = await folderBelongsToUser(user.data, input.parentId);
    if (!valid) {
      return { success: false, error: "Parent folder not found" };
    }
  }

  const folder = await createFolderRecord(user.data, input);
  return { success: true, data: folder };
}

export async function renameFolderService(
  id: string,
  name: string,
): Promise<ActionResult<NoteFolder>> {
  const user = await requireUserId();
  if (!user.success) return user;

  const folder = await renameFolderRecord(user.data, id, name);
  if (!folder) return { success: false, error: "Folder not found" };
  return { success: true, data: folder };
}

export async function deleteFolderService(id: string): Promise<ActionResult<void>> {
  const user = await requireUserId();
  if (!user.success) return user;

  const children = await countFolderChildren(user.data, id);
  if (children > 0) {
    return { success: false, error: "Folder is not empty" };
  }

  const deleted = await deleteFolderRecord(user.data, id);
  if (!deleted) return { success: false, error: "Folder not found" };
  return { success: true, data: undefined };
}

export async function createNoteService(
  folderId: string | null,
): Promise<ActionResult<Note>> {
  const user = await requireUserId();
  if (!user.success) return user;

  if (folderId) {
    const valid = await folderBelongsToUser(user.data, folderId);
    if (!valid) {
      return { success: false, error: "Folder not found" };
    }
  }

  const note = await createNoteRecord(user.data, folderId);
  return { success: true, data: note };
}

export async function updateNoteService(
  id: string,
  patch: UpdateNoteInput,
): Promise<ActionResult<Note>> {
  const user = await requireUserId();
  if (!user.success) return user;

  if (patch.folderId) {
    const valid = await folderBelongsToUser(user.data, patch.folderId);
    if (!valid) {
      return { success: false, error: "Folder not found" };
    }
  }

  const note = await updateNoteRecord(user.data, id, patch);
  if (!note) return { success: false, error: "Note not found" };
  return { success: true, data: note };
}

export async function deleteNoteService(id: string): Promise<ActionResult<void>> {
  const user = await requireUserId();
  if (!user.success) return user;

  const deleted = await deleteNoteRecord(user.data, id);
  if (!deleted) return { success: false, error: "Note not found" };
  return { success: true, data: undefined };
}
