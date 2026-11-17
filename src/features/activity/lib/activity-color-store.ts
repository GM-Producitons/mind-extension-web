"use client";

import { create } from "zustand";
import {
  STORED_ACTIVITY_STATES,
  type StoredActivityState,
} from "./activity-states";

const STORAGE_KEY = "me-activity-colors";
const HEX = /^#[0-9a-f]{6}$/;

export type ActivityColorOverrides = Partial<Record<StoredActivityState, string>>;

function readOverrides(): ActivityColorOverrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const next: ActivityColorOverrides = {};
    for (const state of STORED_ACTIVITY_STATES) {
      const value = parsed[state];
      if (typeof value === "string" && HEX.test(value)) next[state] = value;
    }
    return next;
  } catch {
    return {};
  }
}

function writeOverrides(overrides: ActivityColorOverrides) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    return;
  }
}

export function applyActivityColors(overrides: ActivityColorOverrides) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  for (const state of STORED_ACTIVITY_STATES) {
    const value = overrides[state];
    if (value) root.style.setProperty(`--activity-${state}`, value);
    else root.style.removeProperty(`--activity-${state}`);
  }
}

/** Stylesheet token, ignoring an inline override. */
export function readActivityToken(state: StoredActivityState): string {
  const root = document.documentElement;
  const inline = root.style.getPropertyValue(`--activity-${state}`);
  if (inline) root.style.removeProperty(`--activity-${state}`);
  const value = getComputedStyle(root)
    .getPropertyValue(`--activity-${state}`)
    .trim()
    .toLowerCase();
  if (inline) root.style.setProperty(`--activity-${state}`, inline);
  return HEX.test(value) ? value : "#64748b";
}

interface ActivityColorState {
  overrides: ActivityColorOverrides;
  setColor: (state: StoredActivityState, hex: string) => void;
  clearColor: (state: StoredActivityState) => void;
  reset: () => void;
}

export const useActivityColors = create<ActivityColorState>((set, get) => ({
  overrides: readOverrides(),
  setColor: (state, hex) => {
    const value = hex.toLowerCase();
    if (!HEX.test(value)) return;
    const overrides = { ...get().overrides, [state]: value };
    writeOverrides(overrides);
    applyActivityColors(overrides);
    set({ overrides });
  },
  clearColor: (state) => {
    const overrides = { ...get().overrides };
    delete overrides[state];
    writeOverrides(overrides);
    applyActivityColors(overrides);
    set({ overrides });
  },
  reset: () => {
    writeOverrides({});
    applyActivityColors({});
    set({ overrides: {} });
  },
}));
