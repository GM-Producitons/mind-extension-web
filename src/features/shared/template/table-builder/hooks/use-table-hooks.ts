'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { TableRow } from '../types';

/* ─────────────────────────────────────────────── */
/*  useTableState                                  */
/* ─────────────────────────────────────────────── */

export interface UseTableStateOptions {
  /** Initial rows */
  defaultRows?: TableRow[];
}

function generateRowId() {
  return crypto.randomUUID();
}

export function useTableState(options: UseTableStateOptions = {}) {
  const [rows, setRows] = useState<TableRow[]>(options.defaultRows ?? []);

  const addRow = useCallback((defaults?: Partial<TableRow>) => {
    setRows((prev) => [...prev, { _id: generateRowId(), ...defaults }]);
  }, []);

  const removeRow = useCallback((rowId: string) => {
    setRows((prev) => prev.filter((r) => r._id !== rowId));
  }, []);

  const updateCell = useCallback((rowId: string, columnId: string, value: unknown) => {
    setRows((prev) => prev.map((r) => (r._id === rowId ? { ...r, [columnId]: value } : r)));
  }, []);

  const updateRow = useCallback((rowId: string, data: Partial<TableRow>) => {
    setRows((prev) => prev.map((r) => (r._id === rowId ? { ...r, ...data } : r)));
  }, []);

  const moveRow = useCallback((rowId: string, direction: 'up' | 'down') => {
    setRows((prev) => {
      const idx = prev.findIndex((r) => r._id === rowId);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
      return next;
    });
  }, []);

  const reset = useCallback(
    (newRows?: TableRow[]) => {
      setRows(newRows ?? options.defaultRows ?? []);
    },
    [options.defaultRows],
  );

  return { rows, setRows, addRow, removeRow, updateCell, updateRow, moveRow, reset };
}

/* ─────────────────────────────────────────────── */
/*  useTableAutoSave                               */
/* ─────────────────────────────────────────────── */

export interface UseTableAutoSaveOptions {
  rows: TableRow[];
  onSave: (rows: TableRow[]) => void | Promise<void>;
  /** Debounce interval in ms (default: 2000) */
  interval?: number;
  enabled?: boolean;
}

export function useTableAutoSave({
  rows,
  onSave,
  interval = 2000,
  enabled = true,
}: UseTableAutoSaveOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>('');

  const trigger = useCallback(() => {
    if (!enabled) return;
    // Exclude _id from comparison — server re-assigns IDs on creation and
    // syncing those back would otherwise look like a change, causing an
    // infinite save → invalidate → re-render cycle.
    const rowsData = rows.map(({ _id, ...rest }) => rest);
    const serialized = JSON.stringify(rowsData);
    if (serialized === lastSavedRef.current) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      lastSavedRef.current = serialized;
      onSave(rows);
    }, interval);
  }, [rows, onSave, interval, enabled]);

  // Run trigger in an effect so it never executes during the render phase.
  // Calling it directly in the hook body would set up a setTimeout during
  // render; when that timer fires and invokes the server action Next.js
  // throws "Server Functions cannot be called during initial render".
  useEffect(() => {
    trigger();
    // Clean up any pending timer when the effect re-runs or on unmount so
    // we don't fire a stale save after the component is gone.
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [trigger]);

  return { trigger };
}
