"use client";

import { useEffect, useState } from "react";
import { uploadPresigned } from "@vercel/blob/client";
import { toast } from "sonner";
import {
  createPostAction,
  discardUploadsAction,
} from "../actions/myinsta.actions";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_IMAGES,
  type MyInstaPost,
  type PostImage,
} from "../types";

type CreateStep = "pick" | "caption";

interface UseCreatePostOptions {
  onCreated: (post: MyInstaPost) => void;
}

function isAllowedFile(file: File) {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type);
}

function readImageSize(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    image.src = url;
  });
}

function safeFileName(name: string) {
  const trimmed = name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  return trimmed.length > 0 ? trimmed : "image";
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
    if (!next) reset();
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
    const uploaded: PostImage[] = [];

    try {
      for (const [index, file] of files.entries()) {
        const size = await readImageSize(file).catch(() => ({
          width: undefined as number | undefined,
          height: undefined as number | undefined,
        }));
        const blob = await uploadPresigned(
          `myinsta/${safeFileName(file.name)}`,
          file,
          {
            access: "private",
            handleUploadUrl: "/api/myinsta/upload",
          },
        );
        uploaded.push({
          url: blob.url,
          pathname: blob.pathname,
          width: size.width,
          height: size.height,
          order: index,
        });
      }

      const result = await createPostAction({
        caption,
        images: uploaded,
      });

      if (!result.success || !result.data) {
        await discardUploadsAction(uploaded.map((image) => image.pathname));
        toast.error(result.error ?? "Could not create post");
        return;
      }

      toast.success("Posted");
      onCreated(result.data);
      setOpen(false);
      reset();
    } catch (error) {
      await discardUploadsAction(uploaded.map((image) => image.pathname));
      toast.error(
        error instanceof Error ? error.message : "Could not upload images",
      );
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
