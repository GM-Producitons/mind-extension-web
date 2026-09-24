import { PracticePage } from "@/features/flashcards/components/PracticePage";

export default async function PracticeClusterRoute({
  params,
}: {
  params: Promise<{ clusterId: string }>;
}) {
  const { clusterId } = await params;
  return <PracticePage clusterId={clusterId} />;
}
