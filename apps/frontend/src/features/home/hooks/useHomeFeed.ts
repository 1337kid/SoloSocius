import { useInfiniteQuery } from "@tanstack/react-query";

import { getHomeFeed } from "../api";
import { feedQueryKeys } from "../keys";

export function useHomeFeed() {
  return useInfiniteQuery({
    queryKey: feedQueryKeys.lists(),
    queryFn: ({ pageParam = 1 }) => getHomeFeed(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });
}
