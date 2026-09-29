"use client";

import type { ReactNode } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { MyInstaPost } from "../types";
import { PostCarousel } from "./PostCarousel";

interface PostCardProps {
  post: MyInstaPost;
  onLike: () => void;
  onDelete: () => void;
}

function timeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return formatDistanceToNow(date, { addSuffix: true });
}

function IconAction({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          disabled={disabled}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function PostCard({ post, onLike, onDelete }: PostCardProps) {
  const initial = post.username.trim().charAt(0).toUpperCase() || "M";
  const alt = post.caption.trim() || "Post";

  return (
    <article className="border-b border-border">
      <header className="flex h-11 items-center gap-2 px-3">
        <div
          aria-hidden
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
        >
          {initial}
        </div>
        <p className="min-w-0 flex-1 truncate text-sm font-semibold">
          {post.username}
        </p>
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="More"
                >
                  <MoreHorizontal />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>More</TooltipContent>
          </Tooltip>
          <PopoverContent align="end" className="w-36 p-1">
            <Button
              type="button"
              variant="ghost"
              className="h-8 w-full justify-start text-destructive"
              onClick={onDelete}
            >
              Delete
            </Button>
          </PopoverContent>
        </Popover>
      </header>

      <PostCarousel images={post.images} alt={alt} />

      <div className="flex items-center px-1 pt-1">
        <IconAction label={post.liked ? "Unlike" : "Like"} onClick={onLike}>
          <Heart
            className={cn(post.liked && "fill-current text-destructive")}
          />
        </IconAction>
        <IconAction label="Comment" disabled>
          <MessageCircle />
        </IconAction>
        <IconAction label="Share" disabled>
          <Send />
        </IconAction>
        <span className="ml-auto">
          <IconAction label="Save" disabled>
            <Bookmark />
          </IconAction>
        </span>
      </div>

      {post.liked && (
        <p className="px-3 text-sm font-semibold">1 like</p>
      )}

      {post.caption.trim() && (
        <p className="px-3 pt-0.5 text-sm">
          <span className="font-semibold">{post.username}</span>{" "}
          {post.caption}
        </p>
      )}

      <p className="px-3 pt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
        {timeLabel(post.createdAt)}
      </p>
      <p className="px-3 pb-3 pt-1 text-sm text-muted-foreground">
        Add a comment…
      </p>
    </article>
  );
}
