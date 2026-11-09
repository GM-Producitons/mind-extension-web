import { createBar } from "@/features/pace/services/pace.service";
import { parseBarInput } from "@/features/pace/lib/validate";
import { readPaceJson, runPace } from "../_guard";

export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return runPace(request, async () => createBar(parseBarInput(await readPaceJson(request))));
}
