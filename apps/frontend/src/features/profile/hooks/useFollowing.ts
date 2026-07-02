import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { getFollowingData, unfollowRemoteUser } from "../api";
import { profileQueryKeys } from "../keys";
import { toast } from "sonner";

export function useFollowing() {
  return useInfiniteQuery({
    queryKey: profileQueryKeys.followingLists(),
    queryFn: ({ pageParam = 1 }) => getFollowingData(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });
}

export function useUnfollowRemoteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (actorUri: string) => unfollowRemoteUser(actorUri),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.followingLists(),
      });
      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.public,
      });
      toast.success(data.message ?? "User unfollowed successfully.");
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to unfollow user.");
    },
  });
}
