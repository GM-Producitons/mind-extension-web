import { create } from "zustand";

interface OfflineSyncState {
  syncing: boolean;
  pendingCount: number;
  revision: number;
  setSyncing: (syncing: boolean) => void;
  setPendingCount: (pendingCount: number) => void;
  bump: () => void;
}

export const useOfflineSync = create<OfflineSyncState>((set) => ({
  syncing: false,
  pendingCount: 0,
  revision: 0,
  setSyncing: (syncing) => set({ syncing }),
  setPendingCount: (pendingCount) => set({ pendingCount }),
  bump: () => set((state) => ({ revision: state.revision + 1 })),
}));
