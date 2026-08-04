"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import Navbar from "@/components/Navbar";
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
  } = useFollowRequests();

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const followRequests = data?.pages.flatMap((page) => page.followRequests) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <FollowRequestsPage
        data={followRequests}
        totalCount={followRequests.length}
        isLoading={isLoading}
        isError={isError}
        isFetchingNextPage={isFetchingNextPage}
        onApproveRequest={approveRequest}
        isApprovingRequest={isApprovingRequest}
        approvingRequestId={approvingRequestId}
        ref={ref as unknown as React.RefObject<HTMLDivElement>}
      />
    </div>
  );
};

export default FollowRequests;
