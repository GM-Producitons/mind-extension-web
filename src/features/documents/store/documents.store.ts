import { create } from "zustand";
import type { Document } from "../types";

interface DocumentsStore {
  documents: Document[];
  selectedDocumentId: string | null;
  setDocuments: (documents: Document[]) => void;
  addDocument: (document: Document) => void;
  updateDocument: (updated: Document) => void;
  removeDocument: (id: string) => void;
  /** Swap a temporary optimistic doc for the real server doc. Also updates selectedDocumentId if needed. */
  replaceDocument: (tempId: string, real: Document) => void;
  selectDocument: (id: string | null) => void;
}

export const useDocumentsStore = create<DocumentsStore>((set) => ({
  documents: [],
  selectedDocumentId: null,
  setDocuments: (documents) => set({ documents }),
  addDocument: (document) =>
    set((state) => ({ documents: [document, ...state.documents] })),
  updateDocument: (updated) =>
    set((state) => ({
      documents: state.documents.map((d) =>
        d._id === updated._id ? updated : d,
      ),
    })),
  removeDocument: (id) =>
    set((state) => ({
      documents: state.documents.filter((d) => d._id !== id),
      selectedDocumentId:
        state.selectedDocumentId === id ? null : state.selectedDocumentId,
    })),
  replaceDocument: (tempId, real) =>
    set((state) => ({
      documents: state.documents.map((d) => (d._id === tempId ? real : d)),
      selectedDocumentId:
        state.selectedDocumentId === tempId
          ? real._id
          : state.selectedDocumentId,
    })),
  selectDocument: (id) => set({ selectedDocumentId: id }),
}));
