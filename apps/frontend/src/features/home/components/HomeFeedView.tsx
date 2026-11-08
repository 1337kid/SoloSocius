"use client"

import { useEffect } from "react"
import { useInView } from "react-intersection-observer"

import { ColumnHeader } from "@/components/ui/shell"
import { StatusSkeleton } from "@/components/ui/status"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { TimelineItem } from "@/features/timeline/components/TimelineItem"

import { useHomeFeed } from "../hooks/useHomeFeed"

export function HomeFeedView() {
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useHomeFeed()

  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const allPosts = data?.pages.flatMap((page) => page.items) ?? []

  return (
    <>
      <ColumnHeader>
        <h1>Home</h1>
      </ColumnHeader>
      {isLoading ? (
        <div data-slot="feed">
          {Array.from({ length: 5 }).map((_, i) => (
            <StatusSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Failed to load feed</EmptyTitle>
            <EmptyDescription>Please try refreshing the page</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : allPosts.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No posts in your feed yet</EmptyTitle>
            <EmptyDescription>
              Follow some accounts to see their posts here
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
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
              ? Array.from({ length: 3 }).map((_, i) => (
                  <StatusSkeleton key={i} />
                ))
              : null}
          </div>
        </div>
      )}
    </>
  )
}
