"use client"

import { FeedTimeline } from "./FeedTimeline"
import { useFederatedFeed } from "../hooks/useFederatedFeed"

export function FederatedFeedView() {
  const query = useFederatedFeed()

  return (
    <FeedTimeline
      query={query}
      emptyTitle="No federated posts yet"
      emptyDescription="Posts from across the network will show up here"
    />
  )
}
