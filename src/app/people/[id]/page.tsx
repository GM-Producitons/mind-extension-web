import { PersonDetail } from "@/features/people/components/PersonDetail";

export default async function PersonRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PersonDetail id={id} />;
}
