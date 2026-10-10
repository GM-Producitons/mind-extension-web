"use client";

import { useEffect, useState } from "react";
import { getScheduleDashboardStatsAction } from "../actions/schedule.actions";
import type { FlashcardStats, PostsPerWeek } from "../lib/schedule-stats.repository";

export function useScheduleDashboard() {
  const [flashcards, setFlashcards] = useState<FlashcardStats | null>(null);
  const [postsPerWeek, setPostsPerWeek] = useState<PostsPerWeek[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getScheduleDashboardStatsAction().then((result) => {
      if (cancelled) return;
      if (!result.success || !result.data) {
        setError(result.error ?? "Could not load stats");
        setIsLoading(false);
        return;
      }
      setFlashcards(result.data.flashcards);
      setPostsPerWeek(result.data.postsPerWeek);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { flashcards, postsPerWeek, isLoading, error };
}
