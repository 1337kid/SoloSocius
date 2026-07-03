import { queryClient } from "@/lib/query/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { followRemoteUser as followRemoteUserApi } from "../api";

export const useFollowUser = () => {
  return useMutation<{ message: string }, Error, string>({
    mutationFn: (handle) => followRemoteUserApi(handle),
    onSuccess: () => {
      toast.success("User followed successfully");
      queryClient.invalidateQueries({ queryKey: ["following"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    },
  });
};
