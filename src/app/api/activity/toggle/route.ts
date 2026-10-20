import { toggleActivity } from "@/features/activity/services/activity.service";
import {
  activityText,
  authorizeActivityRequest,
  unauthorizedActivityResponse,
} from "../_guard";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!authorizeActivityRequest(request)) return unauthorizedActivityResponse();
  return activityText(await toggleActivity());
}
