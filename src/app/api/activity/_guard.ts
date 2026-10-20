import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

const TEXT_HEADERS = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "no-store",
} as const;

export function authorizeActivityRequest(request: Request): boolean {
  const expected = process.env.ACTIVITY_API_KEY;
  const provided = request.headers.get("x-api-key");
  if (!expected || !provided) return false;

  const expectedBytes = Buffer.from(expected);
  const providedBytes = Buffer.from(provided);
  if (expectedBytes.length !== providedBytes.length) return false;
  return timingSafeEqual(expectedBytes, providedBytes);
}

export function activityText(body: string, status = 200) {
  return new NextResponse(body, { status, headers: TEXT_HEADERS });
}

export function unauthorizedActivityResponse() {
  return activityText("unauthorized", 401);
}
