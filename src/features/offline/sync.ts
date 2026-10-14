"use client";

import { uploadPresigned } from "@vercel/blob/client";
import { createPostAction } from "@/features/myinsta/actions/myinsta.actions";
import type { PostImage } from "@/features/myinsta/types";
import { offlineDb, type OutboxItem } from "./db";
import { readValidSession } from "./session";
import { useOfflineSync } from "./sync-store";

export interface SyncResult {
  synced: string[];
  failed: string[];
}

let inflight: Promise<SyncResult> | null = null;

async function syncMyInstaCreate(item: OutboxItem) {
  const post = await offlineDb.posts.get(item.entityId);
  if (!post) {
    await offlineDb.outbox.delete(item.id);
    return;
  }
  if (!post.pending && post.remoteId) {
    await offlineDb.outbox.delete(item.id);
    return;
  }

  const images = await offlineDb.images
    .where("postClientId")
    .equals(post.clientId)
    .toArray();
  images.sort((a, b) => a.order - b.order);

  const uploaded: PostImage[] = [];
  for (const image of images) {
    let pathname = image.pathname;
    let url = image.remoteUrl;
    if (!pathname || !url) {
      const file = new File([image.blob], image.name || "image", {
        type: image.mime || "image/jpeg",
      });
      const blob = await uploadPresigned(
        `myinsta/${image.name || "image"}`,
        file,
        {
          access: "private",
          handleUploadUrl: "/api/myinsta/upload",
        },
      );
      pathname = blob.pathname;
      url = blob.url;
      await offlineDb.images.update(image.id, { pathname, remoteUrl: url });
    }
    uploaded.push({
      url,
      pathname,
      width: image.width,
      height: image.height,
      order: image.order,
    });
  }

  const result = await createPostAction({
    caption: post.caption,
    images: uploaded,
    clientId: post.clientId,
  });
  if (!result.success || !result.data) {
    throw new Error(result.error ?? "Could not create post");
  }

  await offlineDb.posts.update(post.clientId, {
    pending: false,
    remoteId: result.data._id,
    username: result.data.username,
    caption: result.data.caption,
    liked: result.data.liked,
    createdAt: result.data.createdAt,
    updatedAt: result.data.updatedAt,
  });
  await offlineDb.outbox.delete(item.id);
}

const handlers: Record<string, (item: OutboxItem) => Promise<void>> = {
  "myinsta.create": syncMyInstaCreate,
};

async function refreshPendingCount(userId: string | null) {
  if (!userId) {
    useOfflineSync.getState().setPendingCount(0);
    return;
  }
  const count = await offlineDb.outbox.where("userId").equals(userId).count();
  useOfflineSync.getState().setPendingCount(count);
}

async function runSync(): Promise<SyncResult> {
  const synced: string[] = [];
  const failed: string[] = [];
  const store = useOfflineSync.getState();
  store.setSyncing(true);

  try {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return { synced, failed };
    }

    const session = await readValidSession();
    if (!session) {
      await refreshPendingCount(null);
      return { synced, failed };
    }

    const items = await offlineDb.outbox
      .where("userId")
      .equals(session.userId)
      .toArray();
    items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    for (const item of items) {
      const handler = handlers[item.kind];
      if (!handler) {
        failed.push(item.entityId);
        await offlineDb.outbox.update(item.id, { lastError: "Unknown" });
        continue;
      }
      try {
        await handler(item);
        synced.push(item.entityId);
      } catch (error) {
        failed.push(item.entityId);
        const message =
          error instanceof Error ? error.message : "Could not sync";
        await offlineDb.outbox.update(item.id, { lastError: message });
      }
    }

    await refreshPendingCount(session.userId);
    if (synced.length > 0 || failed.length > 0) store.bump();
    return { synced, failed };
  } finally {
    useOfflineSync.getState().setSyncing(false);
  }
}

export function sync(): Promise<SyncResult> {
  if (inflight) return inflight;
  inflight = runSync().finally(() => {
    inflight = null;
  });
  return inflight;
}
