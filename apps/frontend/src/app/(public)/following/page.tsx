"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Users } from "lucide-react";

import Navbar from "@/components/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useFollowing } from "@/features/profile/hooks/useFollowing";
import { FollowerSkeleton } from "@/features/timeline/components/FollowerSkeleton";

const FollowingPage = () => {
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
      <main className="container mx-auto max-w-xl px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Users className="size-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Following</h1>
          {!isLoading && (
            <span className="text-sm text-muted-foreground ml-auto">
              {following.length}{" "}
              {following.length === 1 ? "following" : "followings"}
            </span>
          )}
        </div>

        <Separator className="mb-4" />

        {isError && (
          <p className="text-sm text-destructive text-center py-8">
            Failed to load following. Please try again.
          </p>
        )}

        {isLoading ? (
          <div>
            {Array.from({ length: 6 }).map((_, i) => (
              <FollowerSkeleton key={i} />
            ))}
          </div>
        ) : following.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            No following yet.
          </p>
        ) : (
          <ul>
            {following.map((following) => {
              const initials = (
                following.actor.displayName || following.actor.username
              )
                .slice(0, 2)
                .toUpperCase();

              return (
                <li key={following.id}>
                  <div className="flex items-center gap-3 py-3">
                    <Avatar size="lg">
                      <AvatarImage
                        src={following.actor.avatarUrl}
                        alt={
                          following.actor.displayName ||
                          following.actor.username
                        }
                      />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {following.actor.displayName ||
                          following.actor.username}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        @{following.actor.username}
                        {following.actor.domain
                          ? `@${following.actor.domain}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <Separator />
                </li>
              );
            })}
          </ul>
        )}

        <div
          ref={ref}
          className="py-4 text-center text-xs text-muted-foreground"
        >
          {isFetchingNextPage && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <FollowerSkeleton key={i} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FollowingPage;
