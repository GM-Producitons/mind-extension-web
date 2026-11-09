import { updateGroupByKey } from "@/features/pace/services/pace.service";
import { parseGroupPatch } from "@/features/pace/lib/validate";
import { readPaceJson, runPace } from "../../_guard";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ idOrSlug: string }> },
) {
  const { idOrSlug } = await context.params;
  return runPace(request, async () =>
    updateGroupByKey(idOrSlug, parseGroupPatch(await readPaceJson(request))),
  );
}
