import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFollowRequestsData, approveFollowRequest, toggleManuallyApprovesFollowers } from "../api";
import { profileQueryKeys } from "../keys";
import { toast } from "sonner";

export function useFollowRequests() {
  const queryClient = useQueryClient();

  const followRequestsQuery = useInfiniteQuery({
    queryKey: profileQueryKeys.followRequestsLists(),
    queryFn: ({ pageParam = 1 }) => getFollowRequestsData(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  const approveRequestMutation = useMutation({
    mutationFn: approveFollowRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.followRequestsLists(),
      });
      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.followersLists(),
      });
      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.public,
      });
    },
  });

  const toggleManualApprovalMutation = useMutation({
    mutationFn: toggleManuallyApprovesFollowers,
    onSuccess: () => {
      toast.success("Followers approval setting updated successfully");
      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.public,
      });
    },
  });

  const approveRequest = (requestId: string) => {
    approveRequestMutation.mutate(requestId);
  };

  const toggleManualApproval = () => {
    toggleManualApprovalMutation.mutate();
  };

  const refetchRequests = () => {
    return followRequestsQuery.refetch();
  };

  const invalidateRequests = () => {
    queryClient.invalidateQueries({
      queryKey: profileQueryKeys.followRequestsLists(),
    });
  };

  return {
    // Query data and state
    data: followRequestsQuery.data,
    isLoading: followRequestsQuery.isLoading,
    isError: followRequestsQuery.isError,
    error: followRequestsQuery.error,
    hasNextPage: followRequestsQuery.hasNextPage,
    isFetchingNextPage: followRequestsQuery.isFetchingNextPage,
    fetchNextPage: followRequestsQuery.fetchNextPage,
    
    // Mutation states
    isApprovingRequest: approveRequestMutation.isPending,
    approvingRequestId: approveRequestMutation.variables,
    isTogglingManualApproval: toggleManualApprovalMutation.isPending,
    
    // Child functions
    approveRequest,
    toggleManualApproval,
    refetchRequests,
    invalidateRequests,
  };
}