import { getBar, updateBarByKey } from "@/features/pace/services/pace.service";
import { parseBarPatch } from "@/features/pace/lib/validate";
import { readPaceJson, runPace } from "../../_guard";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ idOrSlug: string }> },
) {
  const { idOrSlug } = await context.params;
  return runPace(request, () => getBar(idOrSlug));
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ idOrSlug: string }> },
) {
  const { idOrSlug } = await context.params;
  return runPace(request, async () =>
    updateBarByKey(idOrSlug, parseBarPatch(await readPaceJson(request))),
  );
}
