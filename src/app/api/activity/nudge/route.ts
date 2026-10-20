import { takeActivityNudge } from "@/features/activity/services/activity.service";
import {
  activityText,
  authorizeActivityRequest,
  unauthorizedActivityResponse,
} from "../_guard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!authorizeActivityRequest(request)) return unauthorizedActivityResponse();
  return activityText(await takeActivityNudge());
}
