import mongoose from "mongoose";
import { del, issueSignedToken, presignUrl } from "@vercel/blob";
import {
  getBlobCommandOptions,
  getBlobEnvDiagnostics,
} from "@/lib/blob-config";
import { connectMongoose } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { UserModel } from "@/features/shared/models/user.model";
import {
  createPostRecord,
  deletePostRecord,
  getPostRecord,
  listPostRecords,
  toggleLikeRecord,
} from "../lib/myinsta.repository";
import {
  MAX_IMAGES,
  type ActionResult,
  type CreatePostInput,
  type MyInstaPost,
  type PostImage,
} from "../types";

const BLOB_HOST_SUFFIX = ".blob.vercel-storage.com";

function isId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

function isBlobUrl(url: string) {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" && parsed.hostname.endsWith(BLOB_HOST_SUFFIX)
    );
  } catch {
    return false;
  }
}

function normalizeImages(images: PostImage[]): PostImage[] | { error: string } {
  if (!Array.isArray(images) || images.length === 0) {
    return { error: "Add at least one image" };
  }
  if (images.length > MAX_IMAGES) {
    return { error: `Max ${MAX_IMAGES} images` };
  }

  const normalized: PostImage[] = [];
  const pathnames = new Set<string>();

  for (const [index, image] of images.entries()) {
    const url = typeof image.url === "string" ? image.url.trim() : "";
    const pathname =
      typeof image.pathname === "string" ? image.pathname.trim() : "";
    if (!url || !pathname) return { error: "Image is missing" };
    if (!isBlobUrl(url)) return { error: "Image is invalid" };
    if (pathnames.has(pathname)) return { error: "Image is invalid" };
    pathnames.add(pathname);

    normalized.push({
      url,
      pathname,
      width: typeof image.width === "number" ? image.width : undefined,
      height: typeof image.height === "number" ? image.height : undefined,
      order: index,
    });
  }

  return normalized;
}

async function requireUser(): Promise<
  ActionResult<{ userId: string; username: string }>
> {
  const session = await getSessionUser();
  if (!session) return { success: false, error: "Not authenticated" };

  await connectMongoose();
  const user = await UserModel.findById(session.userId)
    .select("name")
    .lean();
  const username =
    (typeof user?.name === "string" && user.name.trim()) ||
    session.username ||
    "me";

  return { success: true, data: { userId: session.userId, username } };
}

function isPrivateBlobUrl(url: string) {
  try {
    return new URL(url).hostname.endsWith(".private.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

async function signImageUrls(images: PostImage[]): Promise<PostImage[]> {
  if (!images.some((image) => isPrivateBlobUrl(image.url))) return images;

  const blobAuth = getBlobCommandOptions();
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
      location: "myinsta.service.ts:signImageUrls",
      message: "blob auth env",
      data: {
        ...getBlobEnvDiagnostics(),
        hasBlobAuth: Boolean(blobAuth.storeId || blobAuth.token),
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  const token = await issueSignedToken({
    pathname: "*",
    operations: ["get"],
    validUntil: Date.now() + 60 * 60 * 1000,
    ...blobAuth,
  });

  return Promise.all(
    images.map(async (image) => {
      if (!isPrivateBlobUrl(image.url)) return image;
      const { presignedUrl } = await presignUrl(token, {
        operation: "get",
        pathname: image.pathname,
        access: "private",
      });
      return { ...image, url: presignedUrl };
    }),
  );
}

async function withSignedImages(post: MyInstaPost): Promise<MyInstaPost> {
  return { ...post, images: await signImageUrls(post.images) };
}

async function deleteBlobs(pathnames: string[]) {
  const unique = [...new Set(pathnames.filter(Boolean))];
  if (unique.length === 0) return;
  try {
    await del(unique, getBlobCommandOptions());
  } catch (error) {
    console.error("Could not delete blobs", error);
  }
}

export async function listPostsService(): Promise<ActionResult<MyInstaPost[]>> {
  const user = await requireUser();
  if (!user.success || !user.data) {
    return { success: false, error: user.error ?? "Not authenticated" };
  }
  const posts = await listPostRecords(user.data.userId);
  const data = await Promise.all(posts.map(withSignedImages));
  return { success: true, data };
}

export async function createPostService(
  input: CreatePostInput,
): Promise<ActionResult<MyInstaPost>> {
  const user = await requireUser();
  if (!user.success || !user.data) {
    return { success: false, error: user.error ?? "Not authenticated" };
  }

  const caption = typeof input.caption === "string" ? input.caption.trim() : "";
  const images = normalizeImages(input.images);
  if ("error" in images) return { success: false, error: images.error };

  const created = await createPostRecord(user.data.userId, user.data.username, {
    caption,
    images,
  });
  return { success: true, data: await withSignedImages(created) };
}

export async function toggleLikeService(
  id: string,
): Promise<ActionResult<MyInstaPost>> {
  const user = await requireUser();
  if (!user.success || !user.data) {
    return { success: false, error: user.error ?? "Not authenticated" };
  }
  if (!isId(id)) return { success: false, error: "Post was not found" };

  const updated = await toggleLikeRecord(id, user.data.userId);
  if (!updated) return { success: false, error: "Post was not found" };
  return { success: true, data: await withSignedImages(updated) };
}

export async function deletePostService(
  id: string,
): Promise<ActionResult<null>> {
  const user = await requireUser();
  if (!user.success || !user.data) {
    return { success: false, error: user.error ?? "Not authenticated" };
  }
  if (!isId(id)) return { success: false, error: "Post was not found" };

  const existing = await getPostRecord(id, user.data.userId);
  if (!existing) return { success: false, error: "Post was not found" };

  await deletePostRecord(id, user.data.userId);
  await deleteBlobs(existing.images.map((image) => image.pathname));
  return { success: true, data: null };
}

export async function discardUploadsService(
  pathnames: string[],
): Promise<ActionResult<null>> {
  const user = await requireUser();
  if (!user.success || !user.data) {
    return { success: false, error: user.error ?? "Not authenticated" };
  }
  if (!Array.isArray(pathnames)) {
    return { success: false, error: "Images are invalid" };
  }
  await deleteBlobs(
    pathnames.filter((pathname) => typeof pathname === "string"),
  );
  return { success: true, data: null };
}
