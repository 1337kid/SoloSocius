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
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useCallback } from "react";

interface PostMediaGridProps {
  mediaItems: MediaItem[] | null;
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
      <DialogContent size="lightbox" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="sr-only">Attached media</DialogTitle>
          <DialogDescription className="sr-only">
            Image {current + 1} of {mediaItems.length}
          </DialogDescription>
        </DialogHeader>
        <div data-slot="lightbox">
          <Carousel
            setApi={setApi}
            opts={{ startIndex, loop: mediaItems.length > 1 }}
          >
            <CarouselContent>
              {mediaItems.map((item, i) => (
                <CarouselItem key={i}>
                  <img src={item.url} alt="" draggable={false} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {mediaItems.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                data-slot="lightbox-nav"
                data-dir="prev"
                onClick={scrollPrev}
              >
                <ChevronLeft />
                <span className="sr-only">Previous</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                data-slot="lightbox-nav"
                data-dir="next"
                onClick={scrollNext}
              >
                <ChevronRight />
                <span className="sr-only">Next</span>
              </Button>
            </>
          )}

          <DialogClose asChild>
            <Button variant="outline" size="icon" data-slot="lightbox-close">
              <X />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>

          {mediaItems.length > 1 && (
            <div data-slot="lightbox-dots">
              {mediaItems.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  data-slot="lightbox-dot"
                  data-active={i === current || undefined}
                  onClick={() => api?.scrollTo(i)}
                  aria-label={`Image ${i + 1}`}
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

  return (
    <>
      <div data-slot="media-grid" data-count={count}>
        {visibleItems.map((item, i) => {
          const hasMore = i === 3 && extraCount > 0;

          return (
            <button
              key={i}
              type="button"
              data-slot="media-cell"
              onClick={() => openDialog(i)}
              aria-label={`View image ${i + 1}`}
            >
              <img src={item.url} alt="" draggable={false} />
              {hasMore ? (
                <span data-slot="media-more">+{extraCount + 1}</span>
              ) : null}
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
