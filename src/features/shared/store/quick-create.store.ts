"use client";

import { create } from "zustand";

type QuickCreate = "post" | "card" | null;

interface QuickCreateState {
  pending: QuickCreate;
  request: (kind: Exclude<QuickCreate, null>) => void;
  clear: () => void;
}

export const useQuickCreate = create<QuickCreateState>((set) => ({
  pending: null,
  request: (kind) => set({ pending: kind }),
  clear: () => set({ pending: null }),
}));
