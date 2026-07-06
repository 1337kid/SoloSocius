import { queryClient } from "@/lib/query/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { followRemoteUser as followRemoteUserApi } from "../api";
import { profileQueryKeys } from "@/features/profile/keys";

export const useFollowUser = () => {
  return useMutation<{ message: string }, Error, string>({
    mutationFn: (actorUri) => followRemoteUserApi(actorUri),
    onSuccess: () => {
      toast.success("User followed successfully");
      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.followingLists(),
      });
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.public });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    },
  });
};
