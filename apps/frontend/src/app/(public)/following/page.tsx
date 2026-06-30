"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import Navbar from "@/components/Navbar";
import { useFollowing } from "@/features/profile/hooks/useFollowing";
import FollowersPage from "@/features/profile/components/FollowersPage";

const Following = () => {
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useFollowing();

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const following = data?.pages.flatMap((page) => page.following) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <FollowersPage
        data={following}
        type="Following"
        isLoading={isLoading}
        isError={isError}
        isFetchingNextPage={isFetchingNextPage}
        ref={ref as unknown as React.RefObject<HTMLDivElement>}
      />
    </div>
  );
};

export default Following;
