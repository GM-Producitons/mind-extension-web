export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface NoteFolder {
  _id: string;
  userId: string;
  parentId: string | null;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  _id: string;
  userId: string;
  folderId: string | null;
  title: string;
  markdown: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VaultSnapshot {
  folders: NoteFolder[];
  notes: Note[];
}

export interface CreateFolderInput {
  name: string;
  parentId?: string | null;
}

export interface UpdateNoteInput {
  title?: string;
  markdown?: string;
  folderId?: string | null;
}
