"use client";

import { useEffect, useState } from "react";
import { getWorkChartAction } from "../actions/activity.actions";
import type { WorkChart } from "../lib/activity-chart";

export function useWorkChart() {
  const [data, setData] = useState<WorkChart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getWorkChartAction().then((result) => {
      if (cancelled) return;
      if (!result.success) {
        setError(result.error);
        setIsLoading(false);
        return;
      }
      setData(result.data);
      setError(null);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, isLoading, error };
}
