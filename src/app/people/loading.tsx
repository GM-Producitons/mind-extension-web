import { PeopleSkeleton } from "@/features/shared/template/page-skeletons";

export default function Loading() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col pb-24">
      <PeopleSkeleton />
    </main>
  );
}
