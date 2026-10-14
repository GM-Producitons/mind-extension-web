import { get } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getBlobCommandOptions } from "@/lib/blob-config";
import { ownedImagePathService } from "@/features/myinsta/services/myinsta.service";

export async function GET(request: Request) {
  const pathname = new URL(request.url).searchParams.get("pathname") ?? "";
  const owned = await ownedImagePathService(pathname);
  if (!owned.success || !owned.data) {
    const status = owned.error === "Not authenticated" ? 401 : 404;
    return NextResponse.json(
      { error: owned.error ?? "Image is invalid" },
      { status },
    );
  }

  try {
    const result = await get(owned.data, {
      access: "private",
      ...getBlobCommandOptions(),
    });
    if (!result || result.statusCode !== 200 || !result.stream) {
      return NextResponse.json({ error: "Image is invalid" }, { status: 404 });
    }

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType || "application/octet-stream",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Image is invalid" }, { status: 404 });
  }
}
