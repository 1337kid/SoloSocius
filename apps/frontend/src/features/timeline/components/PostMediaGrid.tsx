"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { MediaItem } from "../api";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useCallback } from "react";

interface PostMediaGridProps {
  mediaItems: MediaItem[];
}

function MediaCarouselDialog({
  mediaItems,
  startIndex,
  open,
  onOpenChange,
}: {
  mediaItems: MediaItem[];
  startIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    if (!api) return;
    api.scrollTo(startIndex, true);
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, startIndex]);

  const scrollPrev = useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = useCallback(() => api?.scrollNext(), [api]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="min-w-2xl w-full bg-popover border-none shadow-2xl"
      >
        <div className="relative flex items-center justify-center min-h-[300px] max-h-[85vh]">
          <Carousel
            setApi={setApi}
            opts={{ startIndex, loop: mediaItems.length > 1 }}
            className="w-full px-20 py-10"
          >
            <CarouselContent className="ml-0">
              {mediaItems.map((item, i) => (
                <CarouselItem key={i} className="pl-0 flex items-center justify-center">
                  <img
                    src={item.url}
                    className="max-h-[80vh] max-w-full object-cover rounded-lg"
                    draggable={false}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {mediaItems.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={scrollPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full size-9"
              >
                <ChevronLeft className="size-5" />
                <span className="sr-only">Previous</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={scrollNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full size-9"
              >
                <ChevronRight className="size-5" />
                <span className="sr-only">Next</span>
              </Button>
            </>
          )}

          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full size-8"
            >
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>

          {mediaItems.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {mediaItems.map((_, i) => (
                <button
                  key={i}
                  onClick={() => api?.scrollTo(i)}
                  className={cn(
                    "size-1.5 rounded-full transition-all",
                    i === current ? "bg-white scale-125" : "bg-white/40"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PostMediaGrid({ mediaItems }: PostMediaGridProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!mediaItems || mediaItems.length === 0) return null;

  const visibleItems = mediaItems.slice(0, 4);
  const extraCount = mediaItems.length - 4;
  const count = visibleItems.length;

  const openDialog = (index: number) => {
    setSelectedIndex(index);
    setDialogOpen(true);
  };

  const gridClass = cn(
    "grid gap-1 w-full max-w-[400px] mt-2",
    count === 1 && "grid-cols-1",
    count === 2 && "grid-cols-2",
    count === 3 && "grid-cols-2",
    count === 4 && "grid-cols-2",
  );

  return (
    <>
      <div className={gridClass}>
        {visibleItems.map((item, i) => {
          const isLast = i === 3;
          const hasMore = isLast && extraCount > 0;

          const itemClass = cn(
            "relative overflow-hidden rounded-md cursor-pointer group bg-muted",
            count === 1 && "aspect-video",
            count === 2 && "aspect-square",
            count === 3 && i === 0 && "row-span-2 aspect-auto",
            count === 3 && i !== 0 && "aspect-square",
            count === 4 && "aspect-square",
          );

          return (
            <button
              key={i}
              className={itemClass}
              onClick={() => openDialog(i)}
              aria-label={`View image ${i + 1}`}
            >
              <img
                src={item.url}
                alt={item.mimeType}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                draggable={false}
              />
              {hasMore && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-md">
                  <span className="text-white font-semibold text-xl">
                    +{extraCount + 1}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <MediaCarouselDialog
        mediaItems={mediaItems}
        startIndex={selectedIndex}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
