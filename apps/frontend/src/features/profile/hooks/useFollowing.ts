import { useInfiniteQuery } from "@tanstack/react-query";
import { getFollowingData } from "../api";
import { profileQueryKeys } from "../keys";

export function useFollowing() {
  return useInfiniteQuery({
    queryKey: profileQueryKeys.followingLists(),
    queryFn: ({ pageParam = 1 }) => getFollowingData(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });
}
