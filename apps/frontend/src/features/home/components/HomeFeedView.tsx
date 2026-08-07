"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

import { Skeleton } from "@/components/ui/skeleton";

import { useHomeFeed } from "../hooks/useHomeFeed";
import { TimelineItem } from "@/features/timeline/components/TimelineItem";

export function HomeFeedView() {
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useHomeFeed();

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allPosts = data?.pages.flatMap((page) => page.items) ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4 max-sm:space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-start gap-3">
              <Skeleton className="size-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <p className="text-destructive font-semibold">Failed to load feed</p>
          <p className="text-sm text-muted-foreground">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  if (allPosts.length === 0 && !isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <p className="font-semibold text-muted-foreground">
            No posts in your feed yet
          </p>
          <p className="text-sm text-muted-foreground">
            Follow some accounts to see their posts here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-sm:space-y-3">
      {allPosts.map((entry) => (
        <TimelineItem
          key={`${entry.event.createdAt}-${entry.post.idUri}`}
          entry={entry}
          onPostStatsButtonClick={() => {}}
        />
      ))}

      <div ref={ref} className="space-y-4 max-sm:space-y-3 w-full h-[1px]">
        {isFetchingNextPage && (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <Skeleton className="size-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
