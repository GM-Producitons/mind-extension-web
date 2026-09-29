"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  deletePostAction,
  listPostsAction,
  toggleLikeAction,
} from "../actions/myinsta.actions";
import type { MyInstaPost } from "../types";
import { useCreatePost } from "./use-create-post";

export function useMyInstaFeed() {
  const [posts, setPosts] = useState<MyInstaPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<MyInstaPost | null>(null);

  const reload = useCallback(async () => {
    const result = await listPostsAction();
    if (!result.success || !result.data) {
      toast.error(result.error ?? "Could not load posts");
      return;
    }
    setPosts(result.data);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    void listPostsAction().then((result) => {
      if (cancelled) return;
      if (result.success && result.data) setPosts(result.data);
      else toast.error(result.error ?? "Could not load posts");
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const create = useCreatePost({
    onCreated: (post) => {
      setPosts((current) => [post, ...current]);
    },
  });

  const toggleLike = async (id: string) => {
    setPosts((current) =>
      current.map((post) =>
        post._id === id ? { ...post, liked: !post.liked } : post,
      ),
    );
    const result = await toggleLikeAction(id);
    if (!result.success || !result.data) {
      toast.error(result.error ?? "Could not like post");
      await reload();
      return;
    }
    setPosts((current) =>
      current.map((post) => (post._id === id ? result.data! : post)),
    );
  };

  const openDelete = (post: MyInstaPost) => {
    setDeleteTarget(post);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const result = await deletePostAction(deleteTarget._id);
    if (!result.success) {
      toast.error(result.error ?? "Could not delete post");
      return;
    }
    toast.success("Deleted");
    setPosts((current) =>
      current.filter((post) => post._id !== deleteTarget._id),
    );
    setDeleteTarget(null);
  };

  return {
    posts,
    isLoading,
    deleteTarget,
    setDeleteTarget,
    openDelete,
    confirmDelete,
    toggleLike,
    create,
  };
}
