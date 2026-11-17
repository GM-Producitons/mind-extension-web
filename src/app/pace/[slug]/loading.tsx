import { PaceListSkeleton } from "@/features/shared/template/page-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col pb-24">
      <div className="flex items-center gap-2 px-3 py-2">
        <Skeleton className="size-5" />
        <Skeleton className="h-5 w-32" />
      </div>
      <PaceListSkeleton rows={4} />
    </main>
  );
}
