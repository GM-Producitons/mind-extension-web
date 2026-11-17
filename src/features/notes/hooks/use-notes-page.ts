"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  createFolderAction,
  createNoteAction,
  deleteFolderAction,
  deleteNoteAction,
  listVaultAction,
  renameFolderAction,
  updateNoteAction,
} from "../actions/notes.actions";
import type { Note, NoteFolder, UpdateNoteInput } from "../types";

export interface VaultTreeFolder {
  folder: NoteFolder;
  children: VaultTreeFolder[];
  notes: Note[];
}

interface PendingSave {
  noteId: string;
  patch: UpdateNoteInput;
  firstChangeTime: number;
}

const SOFT_DEBOUNCE_MS = 4000;
const MAX_WAIT_MS = 15000;

function parseDates<T extends { createdAt: unknown; updatedAt: unknown }>(
  item: T,
): T & { createdAt: Date; updatedAt: Date } {
  return {
    ...item,
    createdAt: new Date(item.createdAt as string | Date),
    updatedAt: new Date(item.updatedAt as string | Date),
  };
}

function buildFolderTree(
  folders: NoteFolder[],
  notes: Note[],
  parentId: string | null,
): VaultTreeFolder[] {
  return folders
    .filter((f) => f.parentId === parentId)
    .map((folder) => ({
      folder,
      children: buildFolderTree(folders, notes, folder._id),
      notes: notes.filter((n) => n.folderId === folder._id),
    }));
}

export function useNotesPage() {
  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [renameFolderTarget, setRenameFolderTarget] =
    useState<NoteFolder | null>(null);
  const [renameFolderName, setRenameFolderName] = useState("");
  const [deleteFolderTarget, setDeleteFolderTarget] =
    useState<NoteFolder | null>(null);
  const [deleteNoteTarget, setDeleteNoteTarget] = useState<Note | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const notesRef = useRef(notes);
  notesRef.current = notes;

  const pendingSaveRef = useRef<PendingSave | null>(null);
  const softDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    void listVaultAction().then((result) => {
      if (cancelled) return;
      if (result.success) {
        setFolders(
          result.data.folders.map((f) => parseDates(f) as NoteFolder),
        );
        setNotes(result.data.notes.map((n) => parseDates(n) as Note));
      } else {
        toast.error(result.error);
      }
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const flushAutoSave = useCallback(async (targetNoteId?: string) => {
    const pending = pendingSaveRef.current;
    if (!pending) return;
    if (targetNoteId && pending.noteId !== targetNoteId) return;

    if (softDebounceTimerRef.current) {
      clearTimeout(softDebounceTimerRef.current);
      softDebounceTimerRef.current = null;
    }

    const { noteId, patch } = pending;
    pendingSaveRef.current = null;

    if (Object.keys(patch).length === 0) return;

    setIsSaving(true);
    try {
      const result = await updateNoteAction(
        noteId,
        patch as Record<string, unknown>,
      );
      if (result.success) {
        const saved = parseDates(result.data) as Note;
        setNotes((prev) => prev.map((n) => (n._id === noteId ? saved : n)));
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      console.error("Failed to auto-save note", err);
      toast.error("Failed to save note");
    } finally {
      setIsSaving(false);
    }
  }, []);

  const autoSave = useCallback(
    (patch: UpdateNoteInput) => {
      const id = selectedNoteId;
      if (!id) return;

      // Optimistic update in local state for snappy editing
      setNotes((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, ...patch, updatedAt: new Date() } : n,
        ),
      );

      const now = Date.now();
      const existing = pendingSaveRef.current;
      if (existing && existing.noteId === id) {
        existing.patch = { ...existing.patch, ...patch };
      } else {
        if (existing && existing.noteId !== id) {
          void flushAutoSave(existing.noteId);
        }
        pendingSaveRef.current = {
          noteId: id,
          patch: { ...patch },
          firstChangeTime: now,
        };
      }

      // Hard boundary while continuously typing
      const currentPending = pendingSaveRef.current;
      if (currentPending && now - currentPending.firstChangeTime >= MAX_WAIT_MS) {
        void flushAutoSave(id);
        return;
      }

      // Soft debounce: 4 seconds of idle time
      if (softDebounceTimerRef.current) {
        clearTimeout(softDebounceTimerRef.current);
      }
      softDebounceTimerRef.current = setTimeout(() => {
        void flushAutoSave(id);
      }, SOFT_DEBOUNCE_MS);
    },
    [selectedNoteId, flushAutoSave],
  );

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingSaveRef.current) {
        void flushAutoSave();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (softDebounceTimerRef.current) {
        clearTimeout(softDebounceTimerRef.current);
        softDebounceTimerRef.current = null;
      }
      if (pendingSaveRef.current) {
        void flushAutoSave();
      }
    };
  }, [flushAutoSave]);

  const selectedNote = useMemo(
    () => notes.find((n) => n._id === selectedNoteId) ?? null,
    [notes, selectedNoteId],
  );

  const filteredNotes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.markdown.toLowerCase().includes(q),
    );
  }, [notes, searchQuery]);

  const filteredFolders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return folders;
    const noteFolderIds = new Set(
      filteredNotes.map((n) => n.folderId).filter(Boolean) as string[],
    );
    return folders.filter(
      (f) =>
        f.name.toLowerCase().includes(q) || noteFolderIds.has(f._id),
    );
  }, [folders, filteredNotes, searchQuery]);

  const rootNotes = useMemo(
    () => filteredNotes.filter((n) => n.folderId === null),
    [filteredNotes],
  );

  const folderTree = useMemo(
    () => buildFolderTree(filteredFolders, filteredNotes, null),
    [filteredFolders, filteredNotes],
  );

  const toggleFolderExpanded = useCallback((folderId: string) => {
    setExpandedFolderIds((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  }, []);

  const selectNote = useCallback(
    (id: string) => {
      if (selectedNoteId === id) return;

      // Hard debounce: immediately flush pending changes on the current note
      if (pendingSaveRef.current) {
        void flushAutoSave();
      }

      setSelectedNoteId(id);
      const note = notesRef.current.find((n) => n._id === id);
      if (note?.folderId) {
        setExpandedFolderIds((prev) => new Set(prev).add(note.folderId!));
      }
    },
    [selectedNoteId, flushAutoSave],
  );

  const clearSelection = useCallback(() => {
    // Hard debounce: immediately flush pending changes before clearing
    if (pendingSaveRef.current) {
      void flushAutoSave();
    }
    setSelectedNoteId(null);
  }, [flushAutoSave]);

  const createNote = useCallback(async () => {
    if (isSubmitting) return;

    // Hard debounce: immediately flush pending changes on the current note
    if (pendingSaveRef.current) {
      await flushAutoSave();
    }

    setIsSubmitting(true);
    try {
      const result = await createNoteAction({
        folderId: activeFolderId,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      const note = parseDates(result.data) as Note;
      setNotes((prev) => [note, ...prev]);
      setSelectedNoteId(note._id);
      if (note.folderId) {
        setExpandedFolderIds((prev) => new Set(prev).add(note.folderId!));
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [activeFolderId, flushAutoSave, isSubmitting]);

  const createFolder = useCallback(
    async (parentId: string | null = activeFolderId) => {
      if (isSubmitting) return;

      if (pendingSaveRef.current) {
        await flushAutoSave();
      }

      setIsSubmitting(true);
      try {
        const result = await createFolderAction({
          name: "New folder",
          parentId,
        });
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        const folder = parseDates(result.data) as NoteFolder;
        setFolders((prev) => [...prev, folder]);
        if (parentId) {
          setExpandedFolderIds((prev) => new Set(prev).add(parentId));
        }
        setRenameFolderTarget(folder);
        setRenameFolderName(folder.name);
      } finally {
        setIsSubmitting(false);
      }
    },
    [activeFolderId, flushAutoSave, isSubmitting],
  );

  const openRenameFolder = useCallback((folder: NoteFolder) => {
    setRenameFolderTarget(folder);
    setRenameFolderName(folder.name);
  }, []);

  const submitRenameFolder = useCallback(async () => {
    if (!renameFolderTarget || isSubmitting) return;
    const name = renameFolderName.trim();
    if (!name) return;
    setIsSubmitting(true);
    try {
      const result = await renameFolderAction(renameFolderTarget._id, { name });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      const updated = parseDates(result.data) as NoteFolder;
      setFolders((prev) =>
        prev.map((f) => (f._id === updated._id ? updated : f)),
      );
      setRenameFolderTarget(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [renameFolderTarget, renameFolderName, isSubmitting]);

  const confirmDeleteFolder = useCallback(async () => {
    if (!deleteFolderTarget || isSubmitting) return;

    if (pendingSaveRef.current) {
      await flushAutoSave();
    }

    setIsSubmitting(true);
    try {
      const result = await deleteFolderAction(deleteFolderTarget._id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setFolders((prev) => prev.filter((f) => f._id !== deleteFolderTarget._id));
      if (activeFolderId === deleteFolderTarget._id) {
        setActiveFolderId(null);
      }
      setDeleteFolderTarget(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [deleteFolderTarget, activeFolderId, isSubmitting, flushAutoSave]);

  const confirmDeleteNote = useCallback(async () => {
    if (!deleteNoteTarget || isSubmitting) return;
    const targetId = deleteNoteTarget._id;

    // If the note being deleted has pending changes, cancel its pending save
    if (pendingSaveRef.current?.noteId === targetId) {
      if (softDebounceTimerRef.current) {
        clearTimeout(softDebounceTimerRef.current);
        softDebounceTimerRef.current = null;
      }
      pendingSaveRef.current = null;
    } else if (pendingSaveRef.current) {
      // If another note was being edited, flush its changes immediately
      await flushAutoSave();
    }

    setIsSubmitting(true);
    try {
      const result = await deleteNoteAction(targetId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setNotes((prev) => prev.filter((n) => n._id !== targetId));
      if (selectedNoteId === targetId) {
        setSelectedNoteId(null);
      }
      setDeleteNoteTarget(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [deleteNoteTarget, selectedNoteId, isSubmitting, flushAutoSave]);

  return {
    folders,
    notes,
    folderTree,
    rootNotes,
    selectedNote,
    selectedNoteId,
    activeFolderId,
    setActiveFolderId,
    expandedFolderIds,
    toggleFolderExpanded,
    searchQuery,
    setSearchQuery,
    isLoading,
    isSaving,
    selectNote,
    clearSelection,
    createNote,
    createFolder,
    autoSave,
    openRenameFolder,
    renameFolderTarget,
    setRenameFolderTarget,
    renameFolderName,
    setRenameFolderName,
    submitRenameFolder,
    deleteFolderTarget,
    setDeleteFolderTarget,
    deleteNoteTarget,
    setDeleteNoteTarget,
    confirmDeleteFolder,
    confirmDeleteNote,
    isSubmitting,
  };
}
