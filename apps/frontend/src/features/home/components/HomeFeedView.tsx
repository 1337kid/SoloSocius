"use client"

import { FeedTimeline } from "./FeedTimeline"
import { useHomeFeed } from "../hooks/useHomeFeed"

export function HomeFeedView() {
  const query = useHomeFeed()

  return (
    <FeedTimeline
      query={query}
      emptyTitle="No posts in your feed yet"
      emptyDescription="Follow some accounts to see their posts here"
    />
  )
}
