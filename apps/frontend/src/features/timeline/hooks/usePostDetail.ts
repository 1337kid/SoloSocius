import { useQuery } from "@tanstack/react-query";
import { getPost } from "../api";
import { timelineQueryKeys } from "../keys";

export const usePostDetail = (postId: string) => {
  return useQuery({
    queryKey: timelineQueryKeys.detail(postId),
    queryFn: () => getPost(postId),
    enabled: !!postId,
  });
};