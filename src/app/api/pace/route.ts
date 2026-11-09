import { getBoard } from "@/features/pace/services/pace.service";
import { runPace } from "./_guard";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return runPace(request, () => getBoard());
}
