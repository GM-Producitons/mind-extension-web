import { PaceGroupPage } from "@/features/pace/components/PaceGroupPage";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PaceGroupPage slug={slug} />;
}
