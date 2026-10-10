"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  addBucketItemAction,
  listBucketItemsAction,
} from "../actions/bucket-list.actions";
import type { BucketItemRecord } from "../lib/bucket-list.repository";

export function useBucketList() {
  const [items, setItems] = useState<BucketItemRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const reload = useCallback(async () => {
    const result = await listBucketItemsAction();
    if (!result.success) {
      toast.error(
        "error" in result ? result.error : "Could not load bucket",
      );
      return;
    }
    if (!result.data) return;
    setItems(result.data);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void listBucketItemsAction().then((result) => {
      if (cancelled) return;
      if (result.success && result.data) setItems(result.data);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const addItem = async (label: string) => {
    setIsAdding(true);
    const result = await addBucketItemAction(label);
    setIsAdding(false);
    if (!result.success || !result.data) {
      toast.error(result.error ?? "Could not add item");
      return;
    }
    setItems((prev) => [...prev, result.data]);
  };

  return { items, isLoading, isAdding, addItem, reload };
}
