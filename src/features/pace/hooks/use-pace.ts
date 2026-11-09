"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addPaceEntryAction,
  createPaceBarAction,
  createPaceGroupAction,
  getPaceBoardAction,
  listPaceEntriesAction,
  undoPaceEntryAction,
  updatePaceBarAction,
  updatePaceGroupAction,
} from "../actions/pace.actions";
import { findBar } from "../lib/pace-board";
import type { PaceBoard, PaceEntryView } from "../types";

export function usePaceBoard() {
  const [board, setBoard] = useState<PaceBoard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const result = await getPaceBoardAction();
    if (!result.success) {
      setError(result.error);
      setIsLoading(false);
      return result;
    }
    setBoard(result.data);
    setError(null);
    setIsLoading(false);
    return result;
  }, []);

  useEffect(() => {
    let cancelled = false;
    void getPaceBoardAction().then((result) => {
      if (cancelled) return;
      if (!result.success) {
        setError(result.error);
        setIsLoading(false);
        return;
      }
      setBoard(result.data);
      setError(null);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const createGroup = useCallback(
    async (input: unknown) => {
      const result = await createPaceGroupAction(input);
      if (result.success) await reload();
      return result;
    },
    [reload],
  );

  const updateGroup = useCallback(
    async (slug: string, input: unknown) => {
      const result = await updatePaceGroupAction(slug, input);
      if (result.success) await reload();
      return result;
    },
    [reload],
  );

  const createBar = useCallback(
    async (input: unknown) => {
      const result = await createPaceBarAction(input);
      if (result.success) await reload();
      return result;
    },
    [reload],
  );

  const updateBar = useCallback(
    async (slug: string, input: unknown) => {
      const result = await updatePaceBarAction(slug, input);
      if (result.success) await reload();
      return result;
    },
    [reload],
  );

  const addEntry = useCallback(
    async (slug: string, input: unknown) => {
      const result = await addPaceEntryAction(slug, input);
      if (result.success) await reload();
      return result;
    },
    [reload],
  );

  const undo = useCallback(
    async (slug: string) => {
      const result = await undoPaceEntryAction(slug);
      if (result.success) await reload();
      return result;
    },
    [reload],
  );

  return {
    board,
    isLoading,
    error,
    reload,
    createGroup,
    updateGroup,
    createBar,
    updateBar,
    addEntry,
    undo,
  };
}

export function usePaceEntries(slug: string | null) {
  const [entries, setEntries] = useState<PaceEntryView[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!slug) return;
    const result = await listPaceEntriesAction(slug);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setEntries(result.data.entries);
    setTotal(result.data.total);
    setError(null);
  }, [slug]);

  useEffect(() => {
    if (!slug) {
      setEntries([]);
      setTotal(0);
      setError(null);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setEntries([]);
    setTotal(0);
    void listPaceEntriesAction(slug).then((result) => {
      if (cancelled) return;
      setIsLoading(false);
      if (!result.success) {
        setError(result.error);
        setEntries([]);
        setTotal(0);
        return;
      }
      setEntries(result.data.entries);
      setTotal(result.data.total);
      setError(null);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { entries, total, isLoading, error, reload };
}

export function useOpenBar(board: PaceBoard | null) {
  const [target, setTarget] = useState<{ slug: string; focusNote: boolean } | null>(null);
  const bar = board && target ? findBar(board, target.slug) : null;
  const history = usePaceEntries(bar?.slug ?? null);

  return {
    bar,
    focusNote: Boolean(target?.focusNote && bar),
    openBar: (slug: string, focusNote = false) => setTarget({ slug, focusNote }),
    closeBar: () => setTarget(null),
    history,
  };
}
