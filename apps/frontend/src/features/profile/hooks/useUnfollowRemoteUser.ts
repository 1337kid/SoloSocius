import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { unfollowRemoteUser } from "../api";
import { profileQueryKeys } from "../keys";

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
