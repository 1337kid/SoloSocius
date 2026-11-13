"use client"

import { FeedTimeline } from "./FeedTimeline"
import { useFederatedFeed } from "../hooks/useFederatedFeed"
import { useTimelineStream } from "@/features/timeline/hooks/useTimelineStream"

export function FederatedFeedView() {
  const query = useFederatedFeed()
  useTimelineStream("public")

  return (
    <FeedTimeline
      query={query}
      emptyTitle="No federated posts yet"
      emptyDescription="Posts from across the network will show up here"
    />
  )
}
