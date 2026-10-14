"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { readValidSession, writeSessionSnapshot } from "@/features/offline/session";
import { sync } from "@/features/offline/sync";
import { useOfflineSync } from "@/features/offline/sync-store";
import {
  deletePostAction,
  listPostsAction,
  sessionSnapshotAction,
  toggleLikeAction,
} from "../actions/myinsta.actions";
import {
  countOutbox,
  downloadMissingImages,
  readLocalFeed,
  removeLocalPost,
  updateLocalLike,
  upsertRemotePosts,
} from "../lib/local-feed";
import type { FeedPost, MyInstaPost } from "../types";
import { useCreatePost } from "./use-create-post";

function signedUrls(posts: MyInstaPost[]) {
  const map = new Map<string, string>();
  for (const post of posts) {
    for (const image of post.images) {
      if (image.pathname && image.url) map.set(image.pathname, image.url);
    }
  }
  return map;
}

export function useMyInstaFeed() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FeedPost | null>(null);
  const pendingCount = useOfflineSync((state) => state.pendingCount);
  const syncing = useOfflineSync((state) => state.syncing);
  const revision = useOfflineSync((state) => state.revision);

  useEffect(() => {
    let cancelled = false;

    const applyCount = async (userId: string) => {
      const count = await countOutbox(userId);
      if (!cancelled) useOfflineSync.getState().setPendingCount(count);
    };

    void (async () => {
      try {
        const session = await readValidSession();
        if (cancelled) return;

        if (session) {
          setNeedsSignIn(false);
          const local = await readLocalFeed(session.userId);
          if (cancelled) return;
          setPosts(local);
          await applyCount(session.userId);
          setIsLoading(false);
        } else if (!navigator.onLine) {
          setNeedsSignIn(true);
          setPosts([]);
          setIsLoading(false);
          return;
        }

        if (!navigator.onLine) return;

        const [snapshot, listed] = await Promise.all([
          sessionSnapshotAction(),
          listPostsAction(),
        ]);
        if (cancelled) return;
        if (!snapshot.success || !snapshot.data) {
          if (!session) {
            setNeedsSignIn(true);
            setPosts([]);
          }
          setIsLoading(false);
          return;
        }

        await writeSessionSnapshot(snapshot.data);
        if (!listed.success || !listed.data) {
          toast.error(listed.error ?? "Could not load posts");
          setIsLoading(false);
          return;
        }

        const userId = snapshot.data.userId;
        const signed = signedUrls(listed.data);
        await upsertRemotePosts(userId, listed.data);
        if (cancelled) return;
        const cached = await readLocalFeed(userId, signed);
        if (cancelled) return;
        setPosts(cached);
        setNeedsSignIn(false);
        setIsLoading(false);
        await applyCount(userId);

        await downloadMissingImages(userId, listed.data);
        if (cancelled) return;
        const withBlobs = await readLocalFeed(userId, signed);
        if (cancelled) return;
        setPosts(withBlobs);
      } catch {
        if (!cancelled) toast.error("Could not load posts");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [revision]);

  const create = useCreatePost({
    onCreated: (post) => {
      setPosts((current) => [
        post,
        ...current.filter((item) => item.clientId !== post.clientId),
      ]);
    },
  });

  const toggleLike = async (id: string) => {
    const post = posts.find((item) => item._id === id);
    if (!post) return;
    if (!navigator.onLine) {
      toast.error("No connection");
      return;
    }
    if (post.pending) {
      toast.error("Sync first");
      return;
    }

    setPosts((current) =>
      current.map((item) =>
        item._id === id ? { ...item, liked: !item.liked } : item,
      ),
    );
    const result = await toggleLikeAction(id);
    if (!result.success || !result.data) {
      toast.error(result.error ?? "Could not like post");
      const session = await readValidSession();
      if (session) setPosts(await readLocalFeed(session.userId));
      return;
    }
    await updateLocalLike(id, result.data.liked);
    setPosts((current) =>
      current.map((item) =>
        item._id === id ? { ...item, liked: result.data!.liked } : item,
      ),
    );
  };

  const openDelete = (post: FeedPost) => {
    setDeleteTarget(post);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (!navigator.onLine) {
      toast.error("No connection");
      return;
    }

    if (deleteTarget.pending) {
      await removeLocalPost(deleteTarget.clientId);
      setPosts((current) =>
        current.filter((post) => post.clientId !== deleteTarget.clientId),
      );
      const session = await readValidSession();
      if (session) {
        useOfflineSync.getState().setPendingCount(await countOutbox(session.userId));
      }
      toast.success("Deleted");
      setDeleteTarget(null);
      return;
    }

    const result = await deletePostAction(deleteTarget._id);
    if (!result.success) {
      toast.error(result.error ?? "Could not delete post");
      return;
    }
    await removeLocalPost(deleteTarget.clientId);
    toast.success("Deleted");
    setPosts((current) =>
      current.filter((post) => post.clientId !== deleteTarget.clientId),
    );
    setDeleteTarget(null);
  };

  const syncNow = useCallback(async () => {
    if (!navigator.onLine) {
      toast.error("No connection");
      return;
    }
    const result = await sync();
    if (result.failed.length > 0) toast.error("Could not sync");
    else toast.success("Synced");
  }, []);

  return {
    posts,
    isLoading,
    needsSignIn,
    pendingCount,
    syncing,
    deleteTarget,
    setDeleteTarget,
    openDelete,
    confirmDelete,
    toggleLike,
    syncNow,
    create,
  };
}
