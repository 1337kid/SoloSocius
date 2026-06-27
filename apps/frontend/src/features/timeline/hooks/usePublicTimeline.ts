import { useInfiniteQuery } from "@tanstack/react-query";

import { getPublicTimeline } from "../api";
import { timelineQueryKeys } from "../query-keys";

export function usePublicTimeline() {
  return useInfiniteQuery({
    queryKey: timelineQueryKeys.lists(),
    queryFn: ({ pageParam = 1 }) => getPublicTimeline(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });
}
