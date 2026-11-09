import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import {
  getActivityStatus,
  getActivityStatusJson,
} from "@/features/activity/services/activity.service";
import {
  activityText,
  authorizeActivityRequest,
  unauthorizedActivityResponse,
} from "../_guard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!authorizeActivityRequest(request)) return unauthorizedActivityResponse();

  const format = new URL(request.url).searchParams.get("format");
  if (format === "json") {
    return NextResponse.json(await getActivityStatusJson(), {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }

  return activityText(await getActivityStatus());
}
