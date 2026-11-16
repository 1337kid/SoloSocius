import { useInfiniteQuery } from "@tanstack/react-query";

import { getUserTimeline } from "../api";
import { timelineQueryKeys } from "../keys";

export function useUserTimeline(webfinger: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: timelineQueryKeys.user(webfinger),
    queryFn: ({ pageParam = 1 }) => getUserTimeline(webfinger, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    enabled: enabled && webfinger.length > 0,
  });
}
