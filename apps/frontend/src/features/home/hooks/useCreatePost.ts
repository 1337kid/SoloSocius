import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createPost, CreatePostRequest } from "../api";
import { feedQueryKeys } from "../keys";
import { activityPubContent } from "@/lib/utils";

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (post: CreatePostRequest) => {
      const content = activityPubContent(post.content);
      return createPost({ ...post, content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["timeline"] });
    },
  });
}
