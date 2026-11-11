import { useInfiniteQuery } from "@tanstack/react-query";

import { getFederatedFeed } from "../api";
import { feedQueryKeys } from "../keys";

export function useFederatedFeed() {
  return useInfiniteQuery({
    queryKey: feedQueryKeys.federated(),
    queryFn: ({ pageParam = 1 }) => getFederatedFeed(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });
}
