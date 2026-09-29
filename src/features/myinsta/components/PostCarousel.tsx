"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { PostImage } from "../types";

interface PostCarouselProps {
  images: PostImage[];
  alt: string;
}

export function PostCarousel({ images, alt }: PostCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const hasMany = images.length > 1;

  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el || el.clientWidth === 0) return;
    const next = Math.round(el.scrollLeft / el.clientWidth);
    setIndex(Math.min(Math.max(next, 0), images.length - 1));
  };

  const go = (next: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const clamped = Math.min(Math.max(next, 0), images.length - 1);
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="relative bg-muted">
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="flex aspect-[4/5] snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((image) => (
          <div
            key={image.pathname}
            className="relative min-w-full w-full shrink-0 snap-center"
          >
            <Image
              src={image.url}
              alt={alt}
              fill
              unoptimized
              className="object-cover"
              sizes="470px"
            />
          </div>
        ))}
      </div>

      {hasMany && index > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              className="absolute top-1/2 left-2 hidden -translate-y-1/2 md:inline-flex"
              onClick={() => go(index - 1)}
              aria-label="Previous image"
            >
              <ChevronLeft />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Previous</TooltipContent>
        </Tooltip>
      )}

      {hasMany && index < images.length - 1 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              className="absolute top-1/2 right-2 hidden -translate-y-1/2 md:inline-flex"
              onClick={() => go(index + 1)}
              aria-label="Next image"
            >
              <ChevronRight />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Next</TooltipContent>
        </Tooltip>
      )}

      {hasMany && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
          {images.map((image, i) => (
            <span
              key={image.pathname}
              className={cn(
                "size-1.5 rounded-full",
                i === index ? "bg-primary" : "bg-background/80",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
