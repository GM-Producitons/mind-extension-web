import { ChatSkeleton } from "@/features/shared/template/page-skeletons";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <ChatSkeleton />
    </div>
  );
}
