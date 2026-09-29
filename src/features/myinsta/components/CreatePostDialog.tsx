"use client";

import { useRef } from "react";
import { ChevronLeft, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { MAX_IMAGES } from "../types";
import type { useCreatePost } from "../hooks/use-create-post";

type CreatePostState = ReturnType<typeof useCreatePost>;

interface CreatePostDialogProps {
  create: CreatePostState;
}

function CreatePostBody({ create }: CreatePostDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(event) => {
          create.addFiles(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />

      {create.step === "pick" ? (
        <div className="grid gap-3">
          {create.previews.length === 0 ? (
            <button
              type="button"
              className="flex min-h-48 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 text-sm text-muted-foreground"
              onClick={() => inputRef.current?.click()}
            >
              <ImagePlus className="size-6" />
              Add photos
            </button>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {create.previews.map((url, index) => (
                <div key={url} className="relative aspect-square">
                  <img
                    src={url}
                    alt=""
                    className="size-full object-cover"
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon-xs"
                        className="absolute top-1 right-1"
                        aria-label="Remove image"
                        onClick={() => create.removeFile(index)}
                      >
                        <X />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Remove</TooltipContent>
                  </Tooltip>
                </div>
              ))}
              {create.files.length < MAX_IMAGES && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="flex aspect-square items-center justify-center border border-dashed border-border text-muted-foreground"
                      onClick={() => inputRef.current?.click()}
                      aria-label="Add photos"
                    >
                      <ImagePlus className="size-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Add photos</TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {create.previews[0] && (
            <img
              src={create.previews[0]}
              alt=""
              className="max-h-56 w-full object-cover"
            />
          )}
          <Textarea
            value={create.caption}
            onChange={(event) => create.setCaption(event.target.value)}
            placeholder="Caption"
            rows={4}
          />
        </div>
      )}
    </>
  );
}

function CreateActions({ create }: CreatePostDialogProps) {
  if (create.step === "pick") {
    return (
      <Button
        type="button"
        disabled={!create.canContinue}
        onClick={create.goCaption}
      >
        Next
      </Button>
    );
  }

  return (
    <div className="flex w-full items-center justify-between gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Back"
            disabled={create.isSubmitting}
            onClick={() => create.setStep("pick")}
          >
            <ChevronLeft />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Back</TooltipContent>
      </Tooltip>
      <Button
        type="button"
        disabled={create.isSubmitting}
        onClick={create.submit}
      >
        {create.isSubmitting ? "Sharing" : "Share"}
      </Button>
    </div>
  );
}

export function CreatePostDialog({ create }: CreatePostDialogProps) {
  const isMobile = useIsMobile();
  const title = create.step === "pick" ? "New post" : "Caption";

  if (isMobile) {
    return (
      <Drawer
        open={create.open}
        onOpenChange={create.setOpen}
        direction="bottom"
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-4">
            <CreatePostBody create={create} />
          </div>
          <DrawerFooter>
            <CreateActions create={create} />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={create.open} onOpenChange={create.setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <CreatePostBody create={create} />
        <DialogFooter className="sm:justify-between">
          <CreateActions create={create} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
