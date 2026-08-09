"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useFollowRequests } from "@/features/profile/hooks/useFollowRequests";
import FollowRequestsPage from "@/features/profile/components/FollowRequestsPage";

const FollowRequests = () => {
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    approveRequest,
    isApprovingRequest,
    approvingRequestId,
    rejectRequest,
    isRejectingRequest,
    rejectingRequestId,
  } = useFollowRequests();

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const followRequests =
    data?.pages.flatMap((page) => page.followRequests) ?? [];

  return (
    <FollowRequestsPage
      data={followRequests}
      totalCount={followRequests.length}
      isLoading={isLoading}
      isError={isError}
      isFetchingNextPage={isFetchingNextPage}
      onApproveRequest={approveRequest}
      onRejectRequest={rejectRequest}
      isApprovingRequest={isApprovingRequest}
      approvingRequestId={approvingRequestId}
      isRejectingRequest={isRejectingRequest}
      rejectingRequestId={rejectingRequestId}
      ref={ref as unknown as React.RefObject<HTMLDivElement>}
    />
  );
};

export default FollowRequests;
