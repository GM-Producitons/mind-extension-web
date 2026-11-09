import { createGroup } from "@/features/pace/services/pace.service";
import { parseGroupInput } from "@/features/pace/lib/validate";
import { readPaceJson, runPace } from "../_guard";

export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return runPace(request, async () => createGroup(parseGroupInput(await readPaceJson(request))));
}
