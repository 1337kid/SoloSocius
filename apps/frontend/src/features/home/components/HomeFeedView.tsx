"use client"

import { FeedTimeline } from "./FeedTimeline"
import { useHomeFeed } from "../hooks/useHomeFeed"
import { useTimelineStream } from "@/features/timeline/hooks/useTimelineStream"

export function HomeFeedView() {
  const query = useHomeFeed()
  useTimelineStream("user")

  return (
    <FeedTimeline
      query={query}
      emptyTitle="No posts in your feed yet"
      emptyDescription="Follow some accounts to see their posts here"
    />
  )
}
