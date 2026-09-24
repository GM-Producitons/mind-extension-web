"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PageHeader } from "@/features/shared/template/page-header";
import { usePracticeSession } from "../hooks/use-practice-session";
import { PracticeCard } from "./PracticeCard";

interface PracticePageProps {
  clusterId: string | null;
}

export function PracticePage({ clusterId }: PracticePageProps) {
  const session = usePracticeSession(clusterId);

  return (
    <TooltipProvider>
      <div className="mx-auto flex w-full max-w-lg flex-col gap-4 p-4">
        <div className="flex items-start gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Back" asChild>
                <Link href="/flashcards">
                  <ChevronLeft />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Back</TooltipContent>
          </Tooltip>
          <PageHeader
            title={session.title || "Practice"}
            size="sm"
            className="mb-0 min-w-0 flex-1"
          />
        </div>

        {session.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading</p>
        ) : session.error ? (
          <p className="text-sm text-muted-foreground">{session.error}</p>
        ) : session.isEmpty ? (
          <p className="text-sm text-muted-foreground">No cards</p>
        ) : session.isComplete ? (
          <p className="text-sm text-muted-foreground">
            Done · {session.gradedCount} graded
          </p>
        ) : session.current ? (
          <PracticeCard
            clue={session.current.clue}
            hidden={session.current.hidden}
            clusterNames={session.clusterNames}
            showClusters={session.showClusters}
            revealed={session.revealed}
            isGrading={session.isGrading}
            positionLabel={session.positionLabel}
            onReveal={session.reveal}
            onGrade={session.grade}
          />
        ) : null}
      </div>
    </TooltipProvider>
  );
}
