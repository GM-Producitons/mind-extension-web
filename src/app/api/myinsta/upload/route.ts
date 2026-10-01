import { issueSignedToken } from "@vercel/blob";
import {
  handleUploadPresigned,
  type HandleUploadPresignedBody,
} from "@vercel/blob/client";
import { NextResponse } from "next/server";
import {
  getBlobCommandOptions,
  getBlobEnvDiagnostics,
  getBlobWebhookPublicKey,
} from "@/lib/blob-config";
import { getSessionUser } from "@/lib/session";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
} from "@/features/myinsta/types";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadPresignedBody;

  try {
    const blobAuth = getBlobCommandOptions();
    const webhookPublicKey = getBlobWebhookPublicKey();
    // #region agent log
    fetch("http://127.0.0.1:7756/ingest/10478ca8-4ac3-4ae4-8a51-5aa285694454", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "cdb854",
      },
      body: JSON.stringify({
        sessionId: "cdb854",
        runId: "prod-blob",
        hypothesisId: "G",
        location: "upload/route.ts:POST",
        message: "blob auth env",
        data: {
          ...getBlobEnvDiagnostics(),
          hasBlobAuth: Boolean(blobAuth.storeId || blobAuth.token),
          hasWebhookKey: Boolean(webhookPublicKey),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    const jsonResponse = await handleUploadPresigned({
      body,
      request,
      webhookPublicKey,
      getSignedToken: async (pathname) => {
        const user = await getSessionUser();
        if (!user) throw new Error("Not authenticated");

        const token = await issueSignedToken({
          pathname,
          operations: ["put"],
          allowedContentTypes: [...ALLOWED_IMAGE_TYPES],
          maximumSizeInBytes: MAX_IMAGE_BYTES,
          validUntil: Date.now() + 60 * 60 * 1000,
          ...blobAuth,
        });

        return {
          token,
          urlOptions: {
            allowedContentTypes: [...ALLOWED_IMAGE_TYPES],
            maximumSizeInBytes: MAX_IMAGE_BYTES,
            addRandomSuffix: true,
            allowOverwrite: false,
            tokenPayload: JSON.stringify({ userId: user.userId }),
          },
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: message },
      { status: message === "Not authenticated" ? 401 : 400 },
    );
  }
}
