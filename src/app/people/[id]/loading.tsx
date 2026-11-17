import { PersonSkeleton } from "@/features/shared/template/page-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-col gap-4 px-3 pt-3 pb-24">
      <Skeleton className="size-9" />
      <PersonSkeleton />
    </main>
  );
}
