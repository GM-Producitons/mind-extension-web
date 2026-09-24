"use client";

import { Button } from "@/components/ui/button";
import type { Grade } from "../types";

interface PracticeCardProps {
  clue: string;
  hidden: string;
  clusterNames: string[];
  showClusters: boolean;
  revealed: boolean;
  isGrading: boolean;
  positionLabel: string;
  onReveal: () => void;
  onGrade: (result: Grade) => void;
}

export function PracticeCard({
  clue,
  hidden,
  clusterNames,
  showClusters,
  revealed,
  isGrading,
  positionLabel,
  onReveal,
  onGrade,
}: PracticeCardProps) {
  return (
    <article className="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{positionLabel}</span>
        {showClusters && clusterNames.length > 0 && (
          <span className="truncate">{clusterNames.join(", ")}</span>
        )}
      </div>
      <p className="whitespace-pre-wrap text-base">{clue}</p>
      {revealed ? (
        <p className="whitespace-pre-wrap rounded-md bg-muted px-3 py-2 text-sm">
          {hidden}
        </p>
      ) : null}
      {revealed ? (
        <div className="flex gap-2">
          <Button
            type="button"
            className="flex-1"
            disabled={isGrading}
            onClick={() => onGrade("knew")}
          >
            Knew it
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={isGrading}
            onClick={() => onGrade("missed")}
          >
            Missed it
          </Button>
        </div>
      ) : (
        <Button type="button" onClick={onReveal}>
          Reveal
        </Button>
      )}
    </article>
  );
}
