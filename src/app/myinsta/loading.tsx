import { FeedSkeleton } from "@/features/shared/template/page-skeletons";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-[470px]">
      <FeedSkeleton />
    </div>
  );
}
