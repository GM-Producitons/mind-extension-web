"use client";

import { create } from "zustand";

type QuickCreate = "post" | "card" | null;
type QuickCreateKind = Exclude<QuickCreate, null>;

const STORAGE_KEY = "me-quick-create";

interface QuickCreateState {
  pending: QuickCreate;
  request: (kind: QuickCreateKind) => void;
  clear: () => void;
}

export const useQuickCreate = create<QuickCreateState>((set) => ({
  pending: null,
  request: (kind) => set({ pending: kind }),
  clear: () => set({ pending: null }),
}));

export function queueQuickCreate(kind: QuickCreateKind) {
  sessionStorage.setItem(STORAGE_KEY, kind);
  useQuickCreate.getState().request(kind);
}

export function hasQuickCreate(kind: QuickCreateKind) {
  return (
    useQuickCreate.getState().pending === kind ||
    sessionStorage.getItem(STORAGE_KEY) === kind
  );
}

export function clearQuickCreate(kind: QuickCreateKind) {
  if (sessionStorage.getItem(STORAGE_KEY) === kind) {
    sessionStorage.removeItem(STORAGE_KEY);
  }
  if (useQuickCreate.getState().pending === kind) {
    useQuickCreate.getState().clear();
  }
}
