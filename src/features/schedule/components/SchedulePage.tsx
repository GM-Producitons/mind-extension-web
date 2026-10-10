"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { PageHeader } from "@/features/shared/template/page-header";
import { useDayPlan } from "../hooks/use-day-plan";
import { useScheduleDashboard } from "../hooks/use-schedule-dashboard";
import { DayPlanSection } from "./DayPlanSection";
import {
  FlashcardsWidget,
  MissionsRadial,
  MoneySankey,
  PostsAreaChart,
  TestosteroneMeter,
} from "./ScheduleWidgets";
import { BucketListPhysics } from "./BucketListPhysics";

export function SchedulePage() {
  const { plan, isFallback, isLoading, error } = useDayPlan();
  const { flashcards, postsPerWeek } = useScheduleDashboard();

  return (
    <TooltipProvider>
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-col pb-24">
      <PageHeader title="Schedule" size="sm" separator className="px-3" />

      {isLoading ? (
        <p className="px-3 py-4 text-xs text-muted-foreground">Loading day…</p>
      ) : error ? (
        <p className="px-3 py-4 text-xs text-destructive">{error}</p>
      ) : plan ? (
        <DayPlanSection plan={plan} isFallback={isFallback} />
      ) : (
        <p className="px-3 py-4 text-xs text-muted-foreground">No plan available.</p>
      )}

      <TestosteroneMeter />
      <MissionsRadial missions={plan?.missions ?? []} />
      <MoneySankey />
      <FlashcardsWidget stats={flashcards} />
      <PostsAreaChart weeks={postsPerWeek} />
      <BucketListPhysics />
    </main>
    </TooltipProvider>
  );
}
