import { Skeleton } from "@/components/ui/skeleton";

export function TimelineSkeleton() {
  return (
    <div className="w-full pb-8">
      <Skeleton className="h-3 w-full rounded-full" />
      <div className="mt-3 flex gap-3">
        <Skeleton className="h-7 w-24 rounded-none" />
        <Skeleton className="h-7 w-40 rounded-none" />
        <Skeleton className="mt-8 h-7 w-28 rounded-none" />
      </div>
    </div>
  );
}

export function PaceListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div>
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="flex flex-col gap-1.5 border-b border-border px-3 py-2"
        >
          <Skeleton className="h-3.5 w-36" />
          <div className="flex gap-0.5">
            {Array.from({ length: 8 }, (_, box) => (
              <Skeleton key={box} className="size-3 rounded-none" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ActivityBarsSkeleton() {
  const widths = ["72%", "28%", "100%", "46%"];
  return (
    <div className="grid gap-1">
      {widths.map((width) => (
        <div key={width} className="flex items-center gap-2">
          <Skeleton className="size-3.5 shrink-0 rounded-full" />
          <Skeleton className="h-4" style={{ width }} />
          <Skeleton className="ml-auto h-3 w-12 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function ActivityChartSkeleton() {
  const heights = ["42%", "68%", "30%", "80%", "55%", "36%", "62%"];
  return (
    <div className="flex h-56 items-end gap-2 px-8 pb-6">
      {heights.map((height) => (
        <Skeleton key={height} className="flex-1 rounded-none" style={{ height }} />
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen w-full bg-background p-4 pt-16 sm:p-20">
      <div className="mb-3 flex justify-end">
        <Skeleton className="h-8 w-28" />
      </div>
      <TimelineSkeleton />
      <div className="mt-8 border-t border-border pt-2">
        <div className="flex items-center justify-between px-3 py-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-12" />
        </div>
        <PaceListSkeleton rows={3} />
      </div>
      <section className="mt-8 border-t border-border">
        <div className="flex items-start justify-between gap-3 px-3 py-2">
          <div className="grid gap-1.5">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex gap-1">
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-6 w-14" />
            <Skeleton className="size-6" />
          </div>
        </div>
        <div className="px-3 pb-2">
          <ActivityBarsSkeleton />
        </div>
        <ActivityChartSkeleton />
      </section>
    </div>
  );
}

export function DayPlanSkeleton() {
  return (
    <div>
      <div className="space-y-2 border-b border-border px-3 py-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
      <div className="relative mx-3 mt-3 h-72">
        <Skeleton className="absolute top-2 left-12 h-10 w-[70%]" />
        <Skeleton className="absolute top-16 left-12 h-16 w-[70%]" />
        <Skeleton className="absolute top-40 left-12 h-8 w-[50%]" />
        <Skeleton className="absolute top-56 left-12 h-12 w-[70%]" />
      </div>
    </div>
  );
}

export function ScheduleSkeleton() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-col gap-4 pb-24">
      <DayPlanSkeleton />
      <div className="grid grid-cols-2 gap-2 px-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    </main>
  );
}

export function PeopleSkeleton() {
  return (
    <div className="relative h-[70vh] w-full">
      <Skeleton className="absolute top-[30%] left-[22%] size-3 rounded-full" />
      <Skeleton className="absolute top-[48%] left-[48%] size-3 rounded-full" />
      <Skeleton className="absolute top-[36%] left-[68%] size-3 rounded-full" />
      <Skeleton className="absolute top-[62%] left-[38%] size-3 rounded-full" />
    </div>
  );
}

export function PersonSkeleton() {
  return (
    <div className="grid gap-4">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div>
      {Array.from({ length: 2 }, (_, index) => (
        <div key={index} className="border-b border-border">
          <div className="flex items-center gap-2 px-3 py-2">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="flex gap-3 px-3 py-2">
            <Skeleton className="size-5" />
            <Skeleton className="size-5" />
            <Skeleton className="size-5" />
          </div>
          <div className="grid gap-1.5 px-3 pb-3">
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ClusterGridSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="flex flex-col gap-2 rounded-lg border p-3">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function FlashcardsSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl p-4">
      <div className="mb-4 flex flex-wrap gap-2">
        <Skeleton className="h-9 w-full sm:w-56" />
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-20" />
      </div>
      <ClusterGridSkeleton />
    </div>
  );
}

export function PracticeCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-4/5" />
      <Skeleton className="mt-2 h-9 w-24" />
    </div>
  );
}

export function PracticeSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Skeleton className="size-8" />
        <Skeleton className="h-5 w-32" />
      </div>
      <PracticeCardSkeleton />
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="mx-auto flex h-[600px] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="flex flex-1 flex-col justify-end gap-3 px-4 py-4">
        <Skeleton className="h-8 w-2/5" />
        <Skeleton className="ml-auto h-8 w-1/2" />
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="ml-auto h-8 w-2/5" />
      </div>
      <div className="border-t border-border p-3">
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
}

export function DocumentsSkeleton() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <aside className="flex h-full w-72 shrink-0 flex-col border-r border-border">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-12" />
        </div>
        <div className="px-3 py-2">
          <Skeleton className="h-8 w-full" />
        </div>
        <div className="grid gap-1 px-2">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} className="h-8 w-full" />
          ))}
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function TaskListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-3 rounded-lg bg-muted p-3">
          <Skeleton className="size-4 shrink-0" />
          <div className="grid min-w-0 flex-1 gap-1.5">
            <Skeleton className="h-3.5 w-2/3 bg-background" />
            <Skeleton className="h-3 w-1/3 bg-background" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TasksSkeleton() {
  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="size-9" />
        <Skeleton className="h-5 w-28" />
        <Skeleton className="size-9" />
      </div>
      <div className="mb-6 flex justify-end">
        <Skeleton className="h-8 w-28" />
      </div>
      <TaskListSkeleton />
      <div className="mt-6">
        <TaskListSkeleton rows={3} />
      </div>
    </div>
  );
}

export function TtrBankSkeleton() {
  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-6 w-24" />
        <span className="w-10" />
      </div>
      <Skeleton className="mb-6 h-9 w-full" />
      <TaskListSkeleton rows={6} />
    </div>
  );
}

export function BusSkeleton() {
  return (
    <div className="flex w-full justify-center p-4">
      <Skeleton className="h-9 w-40" />
    </div>
  );
}
