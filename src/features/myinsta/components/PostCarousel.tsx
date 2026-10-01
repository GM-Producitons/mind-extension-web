"use client";

import { useMemo, useRef, useState } from "react";
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

type ImageDims = { width: number; height: number };

function storedDims(image: PostImage): ImageDims | null {
  if (
    typeof image.width === "number" &&
    image.width > 0 &&
    typeof image.height === "number" &&
    image.height > 0
  ) {
    return { width: image.width, height: image.height };
  }
  return null;
}

function initialDimsMap(images: PostImage[]) {
  const map: Record<string, ImageDims> = {};
  for (const image of images) {
    const dims = storedDims(image);
    if (dims) map[image.pathname] = dims;
  }
  return map;
}

function CarouselSlideImage({
  image,
  alt,
  onDims,
}: {
  image: PostImage;
  alt: string;
  onDims: (pathname: string, dims: ImageDims) => void;
}) {
  return (
    <Image
      src={image.url}
      alt={alt}
      fill
      unoptimized
      className="object-contain object-center"
      sizes="470px"
      onLoad={(event) => {
        const img = event.currentTarget;
        onDims(image.pathname, {
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      }}
    />
  );
}

export function PostCarousel({ images, alt }: PostCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [dimsByPath, setDimsByPath] = useState<Record<string, ImageDims>>(() =>
    initialDimsMap(images),
  );
  const hasMany = images.length > 1;

  const registerDims = (pathname: string, dims: ImageDims) => {
    setDimsByPath((prev) => {
      const existing = prev[pathname];
      if (
        existing &&
        existing.width === dims.width &&
        existing.height === dims.height
      ) {
        return prev;
      }
      return { ...prev, [pathname]: dims };
    });
  };

  const currentImage = images[Math.min(index, images.length - 1)];
  const currentDims = currentImage ? dimsByPath[currentImage.pathname] : null;

  const aspectRatio = useMemo(() => {
    if (!currentDims) return "4 / 5";
    return `${currentDims.width} / ${currentDims.height}`;
  }, [currentDims]);

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
    <div
      className="relative w-full bg-muted"
      style={{ aspectRatio }}
    >
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="flex h-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((image) => (
          <div
            key={image.pathname}
            className="relative h-full min-w-full w-full shrink-0 snap-center"
          >
            <CarouselSlideImage
              image={image}
              alt={alt}
              onDims={registerDims}
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
              className="absolute top-1/2 left-2 z-10 hidden -translate-y-1/2 md:inline-flex"
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
              className="absolute top-1/2 right-2 z-10 hidden -translate-y-1/2 md:inline-flex"
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
        <div className="pointer-events-none absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
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
