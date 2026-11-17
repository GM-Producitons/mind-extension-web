"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { DayPlanSkeleton } from "@/features/shared/template/page-skeletons";
import { useDayPlan } from "../hooks/use-day-plan";
import { useScheduleDashboard } from "../hooks/use-schedule-dashboard";
import { DayPlanSection } from "./DayPlanSection";
import { AnalysisCollage } from "./ScheduleWidgets";
import { BucketListPhysics } from "./BucketListPhysics";

export function SchedulePage() {
  const { plan, isFallback, isLoading, error } = useDayPlan();
  const { flashcards, postsPerWeek } = useScheduleDashboard();

  return (
    <TooltipProvider>
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-col pb-24">
      {isLoading ? (
        <DayPlanSkeleton />
      ) : error ? (
        <p className="px-3 py-4 text-xs text-destructive">{error}</p>
      ) : plan ? (
        <DayPlanSection plan={plan} isFallback={isFallback} />
      ) : (
        <p className="px-3 py-4 text-xs text-muted-foreground">No plan available.</p>
      )}

      <AnalysisCollage
        missions={plan?.missions ?? []}
        stats={flashcards}
        weeks={postsPerWeek}
      />
      <BucketListPhysics />
    </main>
    </TooltipProvider>
  );
}
