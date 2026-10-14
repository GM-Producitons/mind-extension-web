import { offlineDb, type OfflineImage, type OfflinePost } from "@/features/offline/db";
import type { FeedPost, MyInstaPost, PostImage } from "../types";

const urlCache = new Map<string, string>();

function safeFileName(name: string) {
  const trimmed = name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  return trimmed.length > 0 ? trimmed : "image";
}

function fileNameFromPath(pathname: string) {
  const segment = pathname.split("/").pop() || "image";
  return safeFileName(segment);
}

function readImageSize(file: Blob) {
  return new Promise<{ width?: number; height?: number }>((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({});
    };
    image.src = url;
  });
}

function blobUrl(image: OfflineImage) {
  const cached = urlCache.get(image.id);
  if (cached) return cached;
  const url = URL.createObjectURL(image.blob);
  urlCache.set(image.id, url);
  return url;
}

function revokeImage(id: string) {
  const url = urlCache.get(id);
  if (!url) return;
  URL.revokeObjectURL(url);
  urlCache.delete(id);
}

function resolveClientId(local: OfflinePost[], remote: MyInstaPost) {
  const match = local.find(
    (post) =>
      post.remoteId === remote._id ||
      post.clientId === remote._id ||
      (remote.clientId != null && post.clientId === remote.clientId),
  );
  return match?.clientId || remote.clientId || remote._id;
}

function toFeedPost(
  post: OfflinePost,
  images: OfflineImage[],
  signed?: Map<string, string>,
): FeedPost {
  const ordered = [...images].sort((a, b) => a.order - b.order);
  return {
    _id: post.remoteId || post.clientId,
    clientId: post.clientId,
    userId: post.userId,
    username: post.username,
    caption: post.caption,
    liked: post.liked,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    pending: post.pending,
    images: ordered.map((image) => ({
      url:
        image.blob && image.blob.size > 0
          ? blobUrl(image)
          : (image.pathname && signed?.get(image.pathname)) ||
            image.remoteUrl ||
            "",
      pathname: image.pathname || image.id,
      width: image.width,
      height: image.height,
      order: image.order,
    })),
  };
}

async function imagesFor(clientIds: string[]) {
  if (clientIds.length === 0) return [];
  return offlineDb.images.where("postClientId").anyOf(clientIds).toArray();
}

export async function readLocalFeed(
  userId: string,
  signed?: Map<string, string>,
): Promise<FeedPost[]> {
  const posts = await offlineDb.posts.where("userId").equals(userId).toArray();
  posts.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const images = await imagesFor(posts.map((post) => post.clientId));
  return posts.map((post) =>
    toFeedPost(
      post,
      images.filter((image) => image.postClientId === post.clientId),
      signed,
    ),
  );
}

export async function countOutbox(userId: string) {
  return offlineDb.outbox.where("userId").equals(userId).count();
}

export async function saveDraftPost(input: {
  userId: string;
  username: string;
  caption: string;
  files: File[];
}): Promise<FeedPost> {
  const clientId = crypto.randomUUID();
  const now = new Date().toISOString();
  const images: OfflineImage[] = [];

  for (const [order, file] of input.files.entries()) {
    const size = await readImageSize(file);
    images.push({
      id: crypto.randomUUID(),
      postClientId: clientId,
      blob: file,
      mime: file.type || "image/jpeg",
      name: safeFileName(file.name),
      width: size.width,
      height: size.height,
      order,
    });
  }

  const post: OfflinePost = {
    clientId,
    userId: input.userId,
    username: input.username,
    caption: input.caption.trim(),
    liked: false,
    createdAt: now,
    updatedAt: now,
    pending: true,
  };

  await offlineDb.transaction(
    "rw",
    offlineDb.posts,
    offlineDb.images,
    offlineDb.outbox,
    async () => {
      await offlineDb.posts.add(post);
      await offlineDb.images.bulkAdd(images);
      await offlineDb.outbox.add({
        id: crypto.randomUUID(),
        userId: input.userId,
        kind: "myinsta.create",
        entityId: clientId,
        createdAt: now,
      });
    },
  );

  return toFeedPost(post, images);
}

export async function upsertRemotePosts(
  userId: string,
  remotePosts: MyInstaPost[],
) {
  const local = await offlineDb.posts.where("userId").equals(userId).toArray();
  await offlineDb.transaction("rw", offlineDb.posts, offlineDb.outbox, async () => {
    for (const remote of remotePosts) {
      const clientId = resolveClientId(local, remote);
      const match = local.find((post) => post.clientId === clientId);
      await offlineDb.posts.put({
        clientId,
        userId,
        remoteId: remote._id,
        username: remote.username,
        caption: remote.caption,
        liked: remote.liked,
        createdAt: remote.createdAt,
        updatedAt: remote.updatedAt,
        pending: false,
      });
      if (match?.pending) {
        await offlineDb.outbox.where("entityId").equals(clientId).delete();
      }
    }
  });
}

async function fetchBlob(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return blob.size > 0 ? blob : null;
  } catch {
    return null;
  }
}

async function downloadImageBytes(image: PostImage) {
  const fromSigned = await fetchBlob(image.url);
  if (fromSigned) return fromSigned;
  return fetchBlob(
    `/api/myinsta/file?pathname=${encodeURIComponent(image.pathname)}`,
  );
}

async function mapPool<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>,
) {
  if (items.length === 0) return;
  let index = 0;
  const run = async () => {
    while (index < items.length) {
      const current = items[index];
      index += 1;
      await worker(current);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => run()),
  );
}

export async function downloadMissingImages(
  userId: string,
  remotePosts: MyInstaPost[],
) {
  const local = await offlineDb.posts.where("userId").equals(userId).toArray();
  const jobs: { postClientId: string; image: PostImage }[] = [];

  for (const remote of remotePosts) {
    const postClientId = resolveClientId(local, remote);
    const stored = await offlineDb.images
      .where("postClientId")
      .equals(postClientId)
      .toArray();
    for (const image of remote.images) {
      const match = stored.find((item) => item.pathname === image.pathname);
      if (match?.blob && match.blob.size > 0) continue;
      jobs.push({ postClientId, image });
    }
  }

  await mapPool(jobs, 4, async (job) => {
    const blob = await downloadImageBytes(job.image);
    if (!blob) return;
    const stored = await offlineDb.images
      .where("postClientId")
      .equals(job.postClientId)
      .toArray();
    const match = stored.find((item) => item.pathname === job.image.pathname);
    if (match) {
      if (urlCache.has(match.id)) {
        URL.revokeObjectURL(urlCache.get(match.id)!);
        urlCache.delete(match.id);
      }
      await offlineDb.images.update(match.id, {
        blob,
        mime: blob.type || match.mime,
        width: job.image.width ?? match.width,
        height: job.image.height ?? match.height,
        order: job.image.order,
        pathname: job.image.pathname,
      });
      return;
    }
    await offlineDb.images.add({
      id: crypto.randomUUID(),
      postClientId: job.postClientId,
      blob,
      mime: blob.type || "image/jpeg",
      name: fileNameFromPath(job.image.pathname),
      width: job.image.width,
      height: job.image.height,
      order: job.image.order,
      pathname: job.image.pathname,
    });
  });
}

export async function updateLocalLike(remoteId: string, liked: boolean) {
  const post = await offlineDb.posts.where("remoteId").equals(remoteId).first();
  if (!post) return;
  await offlineDb.posts.update(post.clientId, { liked });
}

export async function removeLocalPost(clientId: string) {
  const images = await offlineDb.images
    .where("postClientId")
    .equals(clientId)
    .toArray();
  for (const image of images) revokeImage(image.id);
  await offlineDb.transaction(
    "rw",
    offlineDb.posts,
    offlineDb.images,
    offlineDb.outbox,
    async () => {
      await offlineDb.images.where("postClientId").equals(clientId).delete();
      await offlineDb.outbox.where("entityId").equals(clientId).delete();
      await offlineDb.posts.delete(clientId);
    },
  );
}
