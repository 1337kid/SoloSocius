import { useMutation } from "@tanstack/react-query";

import { createPost } from "../api";

export function useCreatePost() {
  return useMutation({
    mutationFn: createPost,
  });
}
