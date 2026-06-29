import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { createPost, CreatePostRequest, getHomeFeed } from "../api";
import { feedQueryKeys } from "../keys";

export function useHomeFeed() {
  return useInfiniteQuery({
    queryKey: feedQueryKeys.lists(),
    queryFn: ({ pageParam = 1 }) => getHomeFeed(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (post: CreatePostRequest) => createPost(post),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedQueryKeys.lists() });
    },
  });
}
