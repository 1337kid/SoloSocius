import { useInfiniteQuery } from "@tanstack/react-query";
import { getFollowersData } from "../api";
import { profileQueryKeys } from "../keys";

export function useFollowers() {
  return useInfiniteQuery({
    queryKey: profileQueryKeys.followersLists(),
    queryFn: ({ pageParam = 1 }) => getFollowersData(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });
}
