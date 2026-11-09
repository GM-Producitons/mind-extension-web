import { voidGrokEntry } from "@/features/pace/services/pace.service";
import { runPace } from "../../../_guard";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ entryId: string }> },
) {
  const { entryId } = await context.params;
  return runPace(request, () => voidGrokEntry(entryId));
}
