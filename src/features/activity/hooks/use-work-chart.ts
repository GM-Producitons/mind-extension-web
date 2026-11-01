"use client";

import { useEffect, useState } from "react";
import { getActivityDashboardAction } from "../actions/activity.actions";
import type { WorkChart } from "../lib/activity-chart";
import type { ActivityStatusJson } from "../lib/activity-time";

export function useWorkChart() {
  const [data, setData] = useState<WorkChart | null>(null);
  const [status, setStatus] = useState<ActivityStatusJson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getActivityDashboardAction().then((result) => {
      if (cancelled) return;
      if (!result.success) {
        setError(result.error);
        setIsLoading(false);
        return;
      }
      setData(result.data.chart);
      setStatus(result.data.status);
      setError(null);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, status, isLoading, error };
}
