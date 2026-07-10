"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { JSONContent } from "@tiptap/react";
import { useDocumentsStore } from "../store/documents.store";
import {
  createDocumentAction,
  getDocumentsAction,
  updateDocumentAction,
  deleteDocumentAction,
} from "../actions/documents.actions";
import type { Document, DocumentType, UpdateDocumentInput } from "../types";

export interface UseDocumentsApi {
  /** All documents sorted by updatedAt desc */
  documents: Document[];
  /** Documents filtered by the current search query */
  filteredDocuments: Document[];
  /** The currently selected document, or null */
  selectedDocument: Document | null;
  /** The id of the currently selected document, or null */
  selectedDocumentId: string | null;
  /** Whether the initial load is in progress */
  isLoading: boolean;
  /** Whether an auto-save is pending/in-flight */
  isSaving: boolean;
  /** Title-search query for sidebar filter */
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  /** Create a blank document and select it */
  createDocument: (type?: DocumentType) => Promise<void>;
  /** Select a document by id */
  selectDocument: (id: string) => void;
  /** Delete a document — optimistic removal from the list */
  deleteDocument: (id: string) => Promise<void>;
  /** Call on every editor change — debounced auto-save (1 s) */
  autoSave: (patch: UpdateDocumentInput) => void;
}

export function useDocuments(): UseDocumentsApi {
  const {
    documents,
    selectedDocumentId,
    setDocuments,
    addDocument,
    updateDocument,
    removeDocument,
    replaceDocument,
    selectDocument,
  } = useDocumentsStore();

  // Stable ref so callbacks always read the latest documents without stale closures
  const documentsRef = useRef<Document[]>(documents);
  documentsRef.current = documents;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Load documents on mount ───────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    void getDocumentsAction().then((result) => {
      if (cancelled) return;
      if (result.success) {
        setDocuments(
          result.data.map((d) => ({
            ...d,
            createdAt: new Date(d.createdAt),
            updatedAt: new Date(d.updatedAt),
            date: d.date ? new Date(d.date) : undefined,
          })),
        );
      }
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [setDocuments]);

  // ── Auto-save (debounced) ─────────────────────────────────────────────────
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPatchRef = useRef<UpdateDocumentInput>({});
  const selectedIdForSaveRef = useRef<string | null>(selectedDocumentId);
  selectedIdForSaveRef.current = selectedDocumentId;
  // Counts retries while a temp doc's server creation is still in flight
  const flushRetryCountRef = useRef(0);

  const flushAutoSave = useCallback(async () => {
    const id = selectedIdForSaveRef.current;
    const patch = pendingPatchRef.current;
    if (!id || Object.keys(patch).length === 0) return;

    // Creation still in flight — retry up to 5×300 ms = 1.5 s
    if (id.startsWith("temp-")) {
      if (flushRetryCountRef.current < 5) {
        flushRetryCountRef.current += 1;
        autoSaveTimerRef.current = setTimeout(() => void flushAutoSave(), 300);
      } else {
        // Give up — drop the patch
        pendingPatchRef.current = {};
        flushRetryCountRef.current = 0;
      }
      return;
    }

    flushRetryCountRef.current = 0;
    pendingPatchRef.current = {};
    setIsSaving(true);
    const result = await updateDocumentAction(
      id,
      patch as Record<string, unknown>,
    );
    if (result.success) {
      updateDocument({
        ...result.data,
        createdAt: new Date(result.data.createdAt),
        updatedAt: new Date(result.data.updatedAt),
        date: result.data.date ? new Date(result.data.date) : undefined,
      });
    }
    setIsSaving(false);
  }, [updateDocument]);

  const autoSave = useCallback(
    (patch: UpdateDocumentInput) => {
      // ── Optimistic: update the store immediately ──────────────────────────
      const id = selectedIdForSaveRef.current;
      if (id) {
        const current = documentsRef.current.find((d) => d._id === id);
        if (current) {
          const { date: patchDate, ...restPatch } = patch;
          const optimistic: Document = {
            ...current,
            ...restPatch,
            ...(patchDate !== undefined
              ? { date: patchDate ?? undefined }
              : {}),
            updatedAt: new Date(),
          };
          updateDocument(optimistic);
        }
      }
      // ── Debounce server save ──────────────────────────────────────────────
      pendingPatchRef.current = { ...pendingPatchRef.current, ...patch };
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => void flushAutoSave(), 1000);
    },
    [flushAutoSave, updateDocument],
  );

  // Flush on unmount to avoid lost updates
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        void flushAutoSave();
      }
    };
  }, [flushAutoSave]);

  // ── Create (optimistic) ───────────────────────────────────────────────────
  const createDocument = useCallback(
    async (type: DocumentType = "note") => {
      // 1. Show a temp doc instantly
      const tempId = `temp-${Date.now()}`;
      const now = new Date();
      const tempDoc: Document = {
        _id: tempId,
        title: "",
        content: { type: "doc", content: [] },
        type,
        createdAt: now,
        updatedAt: now,
      };
      addDocument(tempDoc);
      selectDocument(tempId);

      // 2. Persist — swap temp for real on success
      const result = await createDocumentAction({ title: "", type });
      if (result.success) {
        const realDoc: Document = {
          ...result.data,
          createdAt: new Date(result.data.createdAt),
          updatedAt: new Date(result.data.updatedAt),
          date: result.data.date ? new Date(result.data.date) : undefined,
        };
        replaceDocument(tempId, realDoc);
      } else {
        // Creation failed — remove the optimistic placeholder
        removeDocument(tempId);
      }
    },
    [addDocument, selectDocument, replaceDocument, removeDocument],
  );

  // ── Delete ────────────────────────────────────────────────────────────────
  const deleteDocument = useCallback(
    async (id: string) => {
      removeDocument(id); // optimistic
      await deleteDocumentAction(id);
    },
    [removeDocument],
  );

  // ── Derived ───────────────────────────────────────────────────────────────
  const selectedDocument = useMemo(
    () => documents.find((d) => d._id === selectedDocumentId) ?? null,
    [documents, selectedDocumentId],
  );

  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    const q = searchQuery.toLowerCase();
    return documents.filter((d) => d.title.toLowerCase().includes(q));
  }, [documents, searchQuery]);

  return {
    documents,
    filteredDocuments,
    selectedDocument,
    selectedDocumentId,
    isLoading,
    isSaving,
    searchQuery,
    setSearchQuery,
    createDocument,
    selectDocument,
    deleteDocument,
    autoSave,
  };
}
