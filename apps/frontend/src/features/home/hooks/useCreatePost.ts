import { useMutation } from "@tanstack/react-query";

import { createPost, CreatePostRequest } from "../api";
import { activityPubContent } from "@/lib/utils";

export function useCreatePost() {
  return useMutation({
    mutationFn: (post: CreatePostRequest) => {
      const content = activityPubContent(post.content);
      return createPost({ ...post, content });
    },
  });
}
