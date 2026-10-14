"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { sync } from "@/features/offline/sync";
import { readValidSession, writeSessionSnapshot } from "@/features/offline/session";
import { useOfflineSync } from "@/features/offline/sync-store";
import { clearQuickCreate } from "@/features/shared/store/quick-create.store";
import { sessionSnapshotAction } from "../actions/myinsta.actions";
import { saveDraftPost, countOutbox } from "../lib/local-feed";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_IMAGES,
  type FeedPost,
} from "../types";

type CreateStep = "pick" | "caption";

interface UseCreatePostOptions {
  onCreated: (post: FeedPost) => void;
}

function isAllowedFile(file: File) {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type);
}

function revokeAll(urls: string[]) {
  urls.forEach((url) => URL.revokeObjectURL(url));
}

export function useCreatePost({ onCreated }: UseCreatePostOptions) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<CreateStep>("pick");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const urls = files.map((file) => URL.createObjectURL(file));
    if (!cancelled) setPreviews(urls);
    return () => {
      cancelled = true;
      revokeAll(urls);
    };
  }, [files]);

  const reset = () => {
    setStep("pick");
    setFiles([]);
    setCaption("");
  };

  const setOpenSafe = (next: boolean) => {
    if (isSubmitting) return;
    setOpen(next);
    if (!next) {
      clearQuickCreate("post");
      reset();
    }
  };

  const addFiles = (incoming: File[]) => {
    const accepted: File[] = [];
    for (const file of incoming) {
      if (!isAllowedFile(file)) {
        toast.error("Use jpeg, png, webp, or gif");
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error("Image is too large");
        continue;
      }
      accepted.push(file);
    }
    if (accepted.length === 0) return;

    setFiles((current) => {
      const room = MAX_IMAGES - current.length;
      return [...current, ...accepted.slice(0, Math.max(room, 0))];
    });
  };

  const removeFile = (index: number) => {
    setFiles((current) => current.filter((_, i) => i !== index));
  };

  const goCaption = () => {
    if (files.length === 0) {
      toast.error("Add at least one image");
      return;
    }
    setStep("caption");
  };

  const submit = async () => {
    if (files.length === 0) {
      toast.error("Add at least one image");
      return;
    }

    setIsSubmitting(true);
    try {
      let session = await readValidSession();
      if (!session && navigator.onLine) {
        const snapshot = await sessionSnapshotAction();
        if (snapshot.success && snapshot.data) {
          await writeSessionSnapshot(snapshot.data);
          session = await readValidSession();
        }
      }
      if (!session) {
        toast.error("Sign in while online");
        return;
      }

      const post = await saveDraftPost({
        userId: session.userId,
        username: session.username,
        caption,
        files,
      });
      useOfflineSync
        .getState()
        .setPendingCount(await countOutbox(session.userId));
      onCreated(post);
      clearQuickCreate("post");
      setOpen(false);
      reset();

      if (!navigator.onLine) {
        toast.success("Saved on device");
        return;
      }

      let result = await sync();
      if (!result.synced.includes(post.clientId)) {
        result = await sync();
      }
      if (result.synced.includes(post.clientId)) toast.success("Posted");
      else toast.success("Saved on device");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    open,
    setOpen: setOpenSafe,
    step,
    setStep,
    files,
    previews,
    caption,
    setCaption,
    isSubmitting,
    addFiles,
    removeFile,
    goCaption,
    submit,
    canContinue: files.length > 0 && !isSubmitting,
  };
}
