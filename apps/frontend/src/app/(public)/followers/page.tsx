"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import Navbar from "@/components/Navbar";
import { useFollowers } from "@/features/profile/hooks/useFollowers";
import FollowersPage from "@/features/profile/components/FollowersPage";
import { useProfileData } from "@/features/profile/hooks/useProfileData";

const Followers = () => {
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useFollowers();

  const { data: profile } = useProfileData();
  const totalCount = profile?.followersCount ?? 0;

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const followers = data?.pages.flatMap((page) => page.followers) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <FollowersPage
        data={followers}
        totalCount={totalCount}
        type="Follower"
        isLoading={isLoading}
        isError={isError}
        isFetchingNextPage={isFetchingNextPage}
        ref={ref as unknown as React.RefObject<HTMLDivElement>}
      />
    </div>
  );
};

export default Followers;
