import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { PaceError } from "@/features/pace/pace-error";

const HEADERS = { "Cache-Control": "no-store" } as const;

function authorizePaceRequest(request: Request): boolean {
  const expected = process.env.PACE_API_KEY;
  const provided = request.headers.get("x-api-key");
  if (!expected || !provided) return false;
  const expectedBytes = Buffer.from(expected);
  const providedBytes = Buffer.from(provided);
  if (expectedBytes.length !== providedBytes.length) return false;
  return timingSafeEqual(expectedBytes, providedBytes);
}

export async function readPaceJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new PaceError("Invalid JSON", 400);
  }
}

export async function runPace(
  request: Request,
  work: () => Promise<unknown>,
): Promise<NextResponse> {
  if (!authorizePaceRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: HEADERS });
  }
  try {
    const data = await work();
    return NextResponse.json(data, { headers: HEADERS });
  } catch (error) {
    if (error instanceof PaceError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: HEADERS });
    }
    console.error("pace api", error);
    return NextResponse.json({ error: "Pace request failed" }, { status: 500, headers: HEADERS });
  }
}
