import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { createPost, CreatePostRequest, getHomeFeed } from "../api";
import { feedQueryKeys } from "../keys";
import { activityPubContent } from "@/lib/utils";

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
    mutationFn: (post: CreatePostRequest) => {
      const content = activityPubContent(post.content);
      return createPost({ ...post, content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedQueryKeys.lists() });
    },
  });
}
