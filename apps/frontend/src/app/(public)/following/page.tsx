"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import Navbar from "@/components/Navbar";
import { useFollowing } from "@/features/profile/hooks/useFollowing";
import FollowersPage from "@/features/profile/components/FollowersPage";
import { useProfileData } from "@/features/profile/hooks/useProfile";

const Following = () => {
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useFollowing();

  const { data: profile } = useProfileData();
  const totalCount = profile?.followingCount ?? 0;

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
        totalCount={totalCount}
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
