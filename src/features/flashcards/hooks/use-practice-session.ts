"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getPracticeDeckAction,
  gradeFlashcardAction,
} from "../actions/flashcards.actions";
import type { Flashcard, Grade } from "../types";

function practiceRank(card: Flashcard) {
  if (card.lastResult === "missed") return 0;
  if (card.lastResult == null) return 1;
  return 2;
}

function sortForPractice(cards: Flashcard[]) {
  return [...cards].sort((a, b) => {
    const rank = practiceRank(a) - practiceRank(b);
    if (rank !== 0) return rank;
    const aTime = a.lastTrainedAt ? new Date(a.lastTrainedAt).getTime() : 0;
    const bTime = b.lastTrainedAt ? new Date(b.lastTrainedAt).getTime() : 0;
    return aTime - bTime;
  });
}

export function usePracticeSession(clusterId: string | null) {
  const [title, setTitle] = useState(clusterId ? "" : "All cards");
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGrading, setIsGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setIndex(0);
    setRevealed(false);
    void getPracticeDeckAction(clusterId ?? undefined).then((result) => {
      if (cancelled) return;
      if (!result.success || !result.data) {
        setError(result.error ?? "Could not load cards");
        setCards([]);
        setIsLoading(false);
        return;
      }
      setTitle(result.data.title);
      setCards(sortForPractice(result.data.cards));
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [clusterId]);

  const current = cards[index] ?? null;
  const isComplete = !isLoading && !error && cards.length > 0 && index >= cards.length;

  const reveal = () => {
    if (current) setRevealed(true);
  };

  const grade = async (result: Grade) => {
    if (!current || !revealed || isGrading) return;
    setIsGrading(true);
    const response = await gradeFlashcardAction(current._id, result);
    setIsGrading(false);
    if (!response.success) {
      toast.error(response.error ?? "Could not save grade");
      return;
    }
    setRevealed(false);
    setIndex((value) => value + 1);
  };

  return {
    title,
    current,
    clusterNames: current?.clusters.map((cluster) => cluster.name) ?? [],
    showClusters: clusterId == null,
    revealed,
    isLoading,
    isGrading,
    error,
    isComplete,
    isEmpty: !isLoading && !error && cards.length === 0,
    positionLabel: current ? `${index + 1} / ${cards.length}` : "",
    gradedCount: Math.min(index, cards.length),
    reveal,
    grade,
  };
}
