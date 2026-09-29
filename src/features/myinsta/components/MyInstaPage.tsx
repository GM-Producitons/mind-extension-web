"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/features/shared/template/confirm-dialog";
import { EmptyState } from "@/features/shared/template/empty-state";
import { PageHeader } from "@/features/shared/template/page-header";
import { useMyInstaFeed } from "../hooks/use-myinsta-feed";
import { CreatePostDialog } from "./CreatePostDialog";
import { FeedList } from "./FeedList";

export function MyInstaPage() {
  const page = useMyInstaFeed();

  return (
    <TooltipProvider>
      <div className="mx-auto w-full max-w-[470px]">
        <div className="px-4 pt-4">
          <PageHeader title="MyInsta" size="sm" className="mb-3" />
        </div>

        {page.isLoading ? (
          <p className="px-4 text-sm text-muted-foreground">Loading</p>
        ) : page.posts.length === 0 ? (
          <EmptyState title="No posts" size="sm" />
        ) : (
          <FeedList
            posts={page.posts}
            onLike={page.toggleLike}
            onDelete={page.openDelete}
          />
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon-lg"
              className="fixed right-6 bottom-[5.5rem] z-40 rounded-full"
              aria-label="New post"
              onClick={() => page.create.setOpen(true)}
            >
              <Plus />
            </Button>
          </TooltipTrigger>
          <TooltipContent>New post</TooltipContent>
        </Tooltip>

        <CreatePostDialog create={page.create} />
        <ConfirmDialog
          open={page.deleteTarget != null}
          onOpenChange={(open) => {
            if (!open) page.setDeleteTarget(null);
          }}
          title="Delete post"
          description="Delete this post?"
          confirmLabel="Delete"
          confirmVariant="destructive"
          onConfirm={page.confirmDelete}
        />
      </div>
    </TooltipProvider>
  );
}
