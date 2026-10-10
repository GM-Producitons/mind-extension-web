import { loadDay } from "../lib/load-day";
import {
  getFlashcardStats,
  getPostsPerWeek,
} from "../lib/schedule-stats.repository";
import type { LoadDayResult } from "../types/dayplan";

export async function fetchDayPlan(): Promise<LoadDayResult> {
  return loadDay();
}

export async function getDashboardStats() {
  const [flashcards, postsPerWeek] = await Promise.all([
    getFlashcardStats(),
    getPostsPerWeek(),
  ]);
  return { flashcards, postsPerWeek };
}
