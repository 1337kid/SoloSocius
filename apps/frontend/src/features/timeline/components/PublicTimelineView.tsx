"use client"

import { useEffect, useState } from "react"
import { useInView } from "react-intersection-observer"

import { Dialog } from "@/components/ui/dialog"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { StatusSkeleton } from "@/components/ui/status"
import { useAuth } from "@/features/auth/hooks/useAuth"

import { usePublicTimeline } from "../hooks/usePublicTimeline"
import { useTimelineStream } from "../hooks/useTimelineStream"
import { timelineItemKey, uniqueTimelineItems } from "../stream/apply-stream-event"
import { ShowLoginDialog } from "./ShowLoginDialog"
import { TimelineItem } from "./TimelineItem"

export function PublicTimelineView() {
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = usePublicTimeline()
  useTimelineStream("public:local")

  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const allPosts = uniqueTimelineItems(
    data?.pages.flatMap((page) => page.items) ?? [],
  )
  const { isAuthenticated } = useAuth()
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)

  const handlePostStatsButtonClick = () => {
    if (!isAuthenticated) setIsLoginDialogOpen(true)
  }

  return (
    <>
      {isLoading ? (
        <div data-slot="feed">
          {Array.from({ length: 5 }).map((_, i) => (
            <StatusSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Failed to load timeline</EmptyTitle>
            <EmptyDescription>Please try refreshing the page</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : allPosts.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No posts yet</EmptyTitle>
            <EmptyDescription>Check back later for new content</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div data-slot="feed">
          {allPosts.map((entry) => (
            <TimelineItem
              key={timelineItemKey(entry)}
              entry={entry}
              onPostStatsButtonClick={handlePostStatsButtonClick}
            />
          ))}
          <div ref={ref} data-slot="feed-sentinel">
            {isFetchingNextPage
              ? Array.from({ length: 3 }).map((_, i) => (
                  <StatusSkeleton key={i} />
                ))
              : null}
          </div>
        </div>
      )}
      <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
        <ShowLoginDialog />
      </Dialog>
    </>
  )
}
