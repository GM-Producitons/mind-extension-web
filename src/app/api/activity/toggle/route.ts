import { isActivityState } from "@/features/activity/lib/activity-states";
import { switchActivity } from "@/features/activity/services/activity.service";
import {
  activityText,
  authorizeActivityRequest,
  badRequestActivityResponse,
  unauthorizedActivityResponse,
} from "../_guard";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!authorizeActivityRequest(request)) return unauthorizedActivityResponse();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequestActivityResponse();
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("state" in body) ||
    typeof body.state !== "string"
  ) {
    return badRequestActivityResponse();
  }

  if (!isActivityState(body.state)) {
    return badRequestActivityResponse();
  }

  return activityText(await switchActivity(body.state));
}
