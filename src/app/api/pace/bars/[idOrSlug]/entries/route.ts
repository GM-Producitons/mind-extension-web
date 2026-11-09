import { addApiEntry, getHistory } from "@/features/pace/services/pace.service";
import { parseEntryInput, parseHistoryQuery } from "@/features/pace/lib/validate";
import { readPaceJson, runPace } from "../../../_guard";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ idOrSlug: string }> },
) {
  const { idOrSlug } = await context.params;
  const url = new URL(request.url);
  return runPace(request, () =>
    getHistory(
      idOrSlug,
      parseHistoryQuery({
        from: url.searchParams.get("from"),
        to: url.searchParams.get("to"),
        limit: url.searchParams.get("limit"),
      }),
    ),
  );
}

export async function POST(
  request: Request,
  context: { params: Promise<{ idOrSlug: string }> },
) {
  const { idOrSlug } = await context.params;
  return runPace(request, async () =>
    addApiEntry(idOrSlug, parseEntryInput(await readPaceJson(request))),
  );
}
