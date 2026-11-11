"use client"

import { useEffect } from "react"
import { useInView } from "react-intersection-observer"
import type { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { StatusSkeleton } from "@/components/ui/status"
import type { TimelineResponse } from "@/features/timeline/api"
import { TimelineItem } from "@/features/timeline/components/TimelineItem"

type TimelineQuery = UseInfiniteQueryResult<InfiniteData<TimelineResponse>>

interface FeedTimelineProps {
  query: TimelineQuery
  emptyTitle: string
  emptyDescription: string
}

export function FeedTimeline({
  query,
  emptyTitle,
  emptyDescription,
}: FeedTimelineProps) {
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = query

  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const allPosts = data?.pages.flatMap((page) => page.items) ?? []

  if (isLoading) {
    return (
      <div data-slot="feed">
        {Array.from({ length: 5 }).map((_, i) => (
          <StatusSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Failed to load feed</EmptyTitle>
          <EmptyDescription>Please try refreshing the page</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  if (allPosts.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{emptyTitle}</EmptyTitle>
          <EmptyDescription>{emptyDescription}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div data-slot="feed">
      {allPosts.map((entry) => (
        <TimelineItem
          key={`${entry.event.createdAt}-${entry.post.idUri}`}
          entry={entry}
          onPostStatsButtonClick={() => {}}
        />
      ))}
      <div ref={ref} data-slot="feed-sentinel">
        {isFetchingNextPage
          ? Array.from({ length: 3 }).map((_, i) => <StatusSkeleton key={i} />)
          : null}
      </div>
    </div>
  )
}
