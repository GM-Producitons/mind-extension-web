"use client";

import { useCallback, useEffect, useState } from "react";
import { loadDayPlanAction } from "../actions/schedule.actions";
import type { DayPlan } from "../types/dayplan";

const REFETCH_MS = 10 * 60 * 1000;

export function useDayPlan() {
  const [plan, setPlan] = useState<DayPlan | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    const result = await loadDayPlanAction();
    if (!result.success || !result.data) {
      setError(result.error ?? "Could not load day plan");
      setPlan(null);
      return;
    }
    setError(null);
    setPlan(result.data.plan);
    setIsFallback(result.data.isFallback);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    void loadDayPlanAction().then((result) => {
      if (cancelled) return;
      if (!result.success || !result.data) {
        setError(result.error ?? "Could not load day plan");
        setIsLoading(false);
        return;
      }
      setPlan(result.data.plan);
      setIsFallback(result.data.isFallback);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onFocus = () => void refetch();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refetch]);

  useEffect(() => {
    const id = window.setInterval(() => void refetch(), REFETCH_MS);
    return () => window.clearInterval(id);
  }, [refetch]);

  return { plan, isFallback, isLoading, error, refetch };
}
